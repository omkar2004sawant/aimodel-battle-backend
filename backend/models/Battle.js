import mongoose from 'mongoose';

const scoresSchema = new mongoose.Schema(
  {
    accuracy: { type: Number, min: 0, max: 10, default: 0 },
    completeness: { type: Number, min: 0, max: 10, default: 0 },
    clarity: { type: Number, min: 0, max: 10, default: 0 },
    creativity: { type: Number, min: 0, max: 10, default: 0 },
  },
  { _id: false },
);

const battleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    prompt: { type: String, required: true },
    fileUrl: { type: String, default: null },
    fileType: { type: String, enum: ['pdf', 'image', null], default: null },
    fileName: { type: String, default: null },
    modelA: { type: String, required: true },
    modelB: { type: String, required: true },
    judgeModel: { type: String, required: true },
    responseA: { type: String, required: true },
    responseB: { type: String, required: true },
    latencyA: { type: Number, default: 0 },
    latencyB: { type: Number, default: 0 },
    winner: { type: String, enum: ['A', 'B', 'tie'], required: true },
    scoresA: { type: scoresSchema, default: () => ({}) },
    scoresB: { type: scoresSchema, default: () => ({}) },
    judgeExplanation: { type: String, default: '' },
    tokensUsed: { type: Number, default: 0 },
  },
  { timestamps: true },
);

battleSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Battle', battleSchema);
