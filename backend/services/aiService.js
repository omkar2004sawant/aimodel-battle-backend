import OpenAI from 'openai';

const MODELS = {
  'gpt-oss-20b': 'openai/gpt-oss-20b:free',
  'nemotron-3-super': 'nvidia/nemotron-3-super-120b-a12b:free',
  'gemma-4-26b': 'google/gemma-4-26b-a4b-it:free',
  'nemotron-3-nano': 'nvidia/nemotron-3-nano-30b-a3b:free',
  'nemotron-3-ultra': 'nvidia/nemotron-3-ultra-550b-a55b:free',
};
const client = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    })
  : null;

export function hasOpenAI() {
  return !!client;
}

function resolveModel(id) {
  return MODELS[id] || 'openrouter/free';
}

export async function generateResponse({
  prompt,
  modelId,
  fileContext,
}) {
  const start = performance.now();
  const model = resolveModel(modelId);

  if (!client) {
    return simulateResponse({
      prompt,
      modelId,
      fileContext,
      start,
    });
  }

  const messages = [
    {
      role: 'system',
      content:
        'You are a knowledgeable assistant competing in a head-to-head AI battle. Answer the user clearly and substantively.',
    },
  ];

  if (fileContext) {
    messages.push({
      role: 'system',
      content: `The user uploaded a file. Extracted content:\n\n${fileContext}\n\nGround your answer in it.`,
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  try {
    const completion = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 700,
      temperature: 0.7,
    });

    return {
      content: completion.choices[0]?.message?.content ?? '',
      latencyMs: Math.round(performance.now() - start),
      tokens: completion.usage?.total_tokens ?? 0,
      modelUsed: model,
    };
  } catch (err) {
    console.error('OpenRouter generate error:', err.message);

    return simulateResponse({
      prompt,
      modelId,
      fileContext,
      start,
    });
  }
}

export async function judgeBattle({
  prompt,
  responseA,
  responseB,
  modelAName,
  modelBName,
  judgeModelId,
}) {
  const start = performance.now();

  if (!client) {
    return simulateVerdict({
      prompt,
      responseA,
      responseB,
      modelAName,
      modelBName,
      start,
    });
  }

  const systemPrompt = `You are an impartial AI judge in a head-to-head battle between two AI models.
Model A is "${modelAName}". Model B is "${modelBName}".
Score each response on a 0–10 scale across four criteria: accuracy, completeness, clarity, creativity.
Then declare a winner: "A", "B", or "tie".

Respond ONLY with valid JSON in this exact shape:
{
  "winner": "A" | "B" | "tie",
  "scoresA": {
    "accuracy": number,
    "completeness": number,
    "clarity": number,
    "creativity": number
  },
  "scoresB": {
    "accuracy": number,
    "completeness": number,
    "clarity": number,
    "creativity": number
  },
  "explanation": "string — why the winner won"
}`;

  const userPrompt = `Original prompt:
${prompt}

--- Model A (${modelAName}) response ---
${responseA}

--- Model B (${modelBName}) response ---
${responseB}

Judge fairly.`;

  try {
    const completion = await client.chat.completions.create({
      model: resolveModel(judgeModelId),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: {
        type: 'json_object',
      },
      max_tokens: 800,
      temperature: 0.3,
    });

    const raw =
  completion.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);

    return {
      winner: ['A', 'B', 'tie'].includes(parsed.winner)
        ? parsed.winner
        : 'tie',

      scoresA: normalizeScores(parsed.scoresA),

      scoresB: normalizeScores(parsed.scoresB),

      explanation:
        parsed.explanation || 'No explanation provided.',

      tokensUsed:
        completion.usage?.total_tokens ?? 0,

      latencyMs: Math.round(
        performance.now() - start
      ),
    };
  } catch (err) {
    console.error('OpenRouter judge error:', err.message);

    return simulateVerdict({
      prompt,
      responseA,
      responseB,
      modelAName,
      modelBName,
      start,
    });
  }
}

function normalizeScores(s) {
  const clamp = (n) =>
    Math.max(
      0,
      Math.min(10, Math.round(Number(n) || 0))
    );

  return {
    accuracy: clamp(s?.accuracy),
    completeness: clamp(s?.completeness),
    clarity: clamp(s?.clarity),
    creativity: clamp(s?.creativity),
  };
}

// --------------------------------------------------
// FALLBACK SIMULATION
// Used when OPENROUTER_API_KEY is not available
// --------------------------------------------------

function rng(seed) {
  let h = 1779033703 ^ String(seed).length;

  for (let i = 0; i < String(seed).length; i++) {
    h = Math.imul(
      h ^ String(seed).charCodeAt(i),
      3432918353
    );

    h = (h << 13) | (h >>> 19);
  }

  return () => {
    h = Math.imul(
      h ^ (h >>> 16),
      2246822507
    );

    h = Math.imul(
      h ^ (h >>> 13),
      3266489909
    );

    h ^= h >>> 16;

    return (h >>> 0) / 4294967296;
  };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function simulateResponse({
  prompt,
  modelId,
  fileContext,
  start,
}) {
  const rand = rng(prompt + modelId);

  const styles = [
    `Here is a clear, structured answer to "${prompt}":

1. Core idea — the essential point.
2. Supporting detail — why it holds.
3. Practical takeaway — what it means.

In short: the most relevant facts, kept tight.`,

    `Let me unpack "${prompt}" thoroughly.

First, the context matters. There are a few moving parts, each worth attention. I'll walk through them, then tie it together.

- Background
- Mechanism
- Implications

Conclusion: a balanced, well-supported view.`,

    `Breaking down "${prompt}":

- Premise: what we can assume.
- Evidence: the supporting signals.
- Inference: the reasonable conclusion.
- Risk: where reasoning could falter.

Net read: defensible, with caveats stated.`,
  ];

  const content =
    styles[Math.floor(rand() * styles.length)] +
    (fileContext
      ? `\n\n[Grounded in the uploaded file's extracted content.]`
      : '');

  const latency =
    600 + Math.floor(rand() * 1200);

  await delay(latency);

  return {
    content,
    latencyMs: Math.round(
      performance.now() - start
    ),
    tokens: Math.ceil(content.length / 4),
    modelUsed: modelId,
  };
}

async function simulateVerdict({
  prompt,
  responseA,
  responseB,
  modelAName,
  modelBName,
  start,
}) {
  await delay(
    700 + Math.floor(rng(prompt)() * 900)
  );

  const rand = rng(
    prompt + responseA + responseB
  );

  const clamp = (n) =>
    Math.max(1, Math.min(10, Math.round(n)));

  const score = (len, bias) =>
    clamp(
      6 +
        (len / 600) * 2 +
        bias +
        (rand() - 0.5) * 2
    );

  const scoresA = {
    accuracy: score(responseA.length, 0.3),
    completeness: score(responseA.length, 0.5),
    clarity: score(responseA.length, -0.1),
    creativity: score(responseA.length, 0.2),
  };

  const scoresB = {
    accuracy: score(responseB.length, -0.1),
    completeness: score(responseB.length, 0.4),
    clarity: score(responseB.length, 0.3),
    creativity: score(responseB.length, 0.1),
  };

  const sum = (s) =>
    s.accuracy +
    s.completeness +
    s.clarity +
    s.creativity;

  const totalA = sum(scoresA);
  const totalB = sum(scoresB);

  const winner =
    totalA === totalB
      ? 'tie'
      : totalA > totalB
        ? 'A'
        : 'B';

  const winnerName =
    winner === 'A'
      ? modelAName
      : winner === 'B'
        ? modelBName
        : 'neither';

  const loserName =
    winner === 'A'
      ? modelBName
      : winner === 'B'
        ? modelAName
        : 'either';

  const w =
    winner === 'A'
      ? scoresA
      : scoresB;

  const l =
    winner === 'A'
      ? scoresB
      : scoresA;

  const reasons = [];

  if (w.accuracy > l.accuracy) {
    reasons.push(
      `higher accuracy (${w.accuracy} vs ${l.accuracy})`
    );
  }

  if (w.completeness > l.completeness) {
    reasons.push('more complete coverage');
  }

  if (w.clarity > l.clarity) {
    reasons.push('clearer structure');
  }

  if (w.creativity > l.creativity) {
    reasons.push('more creative framing');
  }

  const explanation =
    winner === 'tie'
      ? `Both ${modelAName} and ${modelBName} performed comparably. Scores are close across all criteria — a tie.`
      : `${winnerName} wins. Compared with ${loserName}, it offered ${reasons.join(', ')}. Total ${sum(w)} vs ${sum(l)}.`;

  return {
    winner,
    scoresA,
    scoresB,
    explanation,
    tokensUsed:
      Math.ceil(
        (responseA.length + responseB.length) / 4
      ) + 320,
    latencyMs: Math.round(
      performance.now() - start
    ),
  };
}