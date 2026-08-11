import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    isVerified: { type: Boolean, default: false },
    verificationTokenHash: { type: String, default: null },
    verificationTokenExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
