import path from 'node:path';
import Battle from '../models/Battle.js';
import { asyncHandler } from '../utils/helpers.js';
import { generateResponse, judgeBattle, hasOpenAI } from '../services/aiService.js';
import { extractPdfText, publicFileUrl, localFilePath } from '../utils/fileUtils.js';
import { upload } from '../middleware/uploadMiddleware.js';

export const createBattle = [
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { prompt, modelA, modelB, judgeModel } = req.body;
    if (!prompt || !modelA || !modelB || !judgeModel) {
      return res.status(400).json({ message: 'prompt, modelA, modelB, judgeModel are required' });
    }

    let fileUrl = null;
    let fileType = null;
    let fileName = null;
    let fileContext = null;

    if (req.file) {
      fileUrl = publicFileUrl(req, req.file.filename);
      fileName = req.file.filename;
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (req.file.mimetype === 'application/pdf') {
        fileType = 'pdf';
        fileContext = await extractPdfText(localFilePath(req.file.filename));
      } else {
        fileType = 'image';
        fileContext = `[Image uploaded: ${req.file.originalname}. Vision analysis would be performed by a multimodal model.]`;
      }
    }

    const [a, b] = await Promise.all([
      generateResponse({ prompt, modelId: modelA, fileContext }),
      generateResponse({ prompt, modelId: modelB, fileContext }),
    ]);

    const verdict = await judgeBattle({
      prompt,
      responseA: a.content,
      responseB: b.content,
      modelAName: modelA,
      modelBName: modelB,
      judgeModelId: judgeModel,
    });

    const battle = await Battle.create({
      user: req.user._id,
      prompt,
      fileUrl,
      fileType,
      fileName,
      modelA,
      modelB,
      judgeModel,
      responseA: a.content,
      responseB: b.content,
      latencyA: a.latencyMs,
      latencyB: b.latencyMs,
      winner: verdict.winner,
      scoresA: verdict.scoresA,
      scoresB: verdict.scoresB,
      judgeExplanation: verdict.explanation,
      tokensUsed: a.tokens + b.tokens + verdict.tokensUsed,
    });

    res.status(201).json({ battle, demoMode: !hasOpenAI() });
  }),
];

export const getStats = asyncHandler(async (req, res) => {
  const battles = await Battle.find({ user: req.user._id }).lean();
  const total = battles.length;
  const decided = battles.filter((b) => b.winner !== 'tie').length;
  const winRate = total > 0 ? Math.round((decided / total) * 100) : 0;

  const accMap = {};
  for (const b of battles) {
    if (b.scoresA?.accuracy != null) {
      accMap[b.modelA] = accMap[b.modelA] || { sum: 0, n: 0 };
      accMap[b.modelA].sum += b.scoresA.accuracy;
      accMap[b.modelA].n += 1;
    }
    if (b.scoresB?.accuracy != null) {
      accMap[b.modelB] = accMap[b.modelB] || { sum: 0, n: 0 };
      accMap[b.modelB].sum += b.scoresB.accuracy;
      accMap[b.modelB].n += 1;
    }
  }
  let mostAccurate = '—';
  let bestAvg = 0;
  for (const [name, v] of Object.entries(accMap)) {
    const avg = v.sum / v.n;
    if (avg > bestAvg) {
      bestAvg = avg;
      mostAccurate = name;
    }
  }
  const tokens = battles.reduce((s, b) => s + (b.tokensUsed || 0), 0);

  res.json({ total, winRate, mostAccurate, tokens, demoMode: !hasOpenAI() });
});
