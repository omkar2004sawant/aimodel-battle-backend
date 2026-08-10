import Battle from '../models/Battle.js';
import { asyncHandler } from '../utils/helpers.js';

export const getHistory = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = { user: req.user._id };
  if (q) {
    filter.$or = [
      { prompt: { $regex: q, $options: 'i' } },
      { modelA: { $regex: q, $options: 'i' } },
      { modelB: { $regex: q, $options: 'i' } },
    ];
  }
  const battles = await Battle.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ battles });
});

export const getBattle = asyncHandler(async (req, res) => {
  const battle = await Battle.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!battle) return res.status(404).json({ message: 'Battle not found' });
  res.json({ battle });
});

export const deleteBattle = asyncHandler(async (req, res) => {
  const battle = await Battle.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!battle) return res.status(404).json({ message: 'Battle not found' });
  res.json({ message: 'Battle deleted' });
});

export const clearHistory = asyncHandler(async (req, res) => {
  await Battle.deleteMany({ user: req.user._id });
  res.json({ message: 'History cleared' });
});
