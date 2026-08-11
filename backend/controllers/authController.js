import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { asyncHandler, generateToken } from '../utils/helpers.js';
import { generateVerificationToken, hashToken, VERIFICATION_TOKEN_EXPIRES_MS } from '../utils/tokenUtils.js';
import { sendVerificationEmail } from '../services/emailService.js';

const FRONTEND_URL = process.env.CLIENT_URL || 'http://localhost:5173';

async function issueVerificationEmail(user) {
  const rawToken = generateVerificationToken();
  const tokenHash = hashToken(rawToken);
  user.verificationTokenHash = tokenHash;
  user.verificationTokenExpires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRES_MS);
  await user.save();

  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
  const { mode } = await sendVerificationEmail({ to: user.email, verificationUrl });
  return mode;
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name || '',
    email,
    password: hashed,
    isVerified: false,
  });

  const emailMode = await issueVerificationEmail(user);

  res.status(201).json({
    message: 'Account created. Check your email for a verification link to activate your account.',
    emailMode,
    email,
  requiresVerification: true,
  token: undefined,
    user: undefined,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (!user.isVerified) {
    return res.status(403).json({
      message: 'Please verify your email before logging in.',
      isVerified: false,
      email,
    });
  }
  const token = generateToken(user._id);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const rawToken = req.query.token;
  if (!rawToken || typeof rawToken !== 'string') {
    return res.status(400).json({ message: 'Verification token is required' });
  }
  const tokenHash = hashToken(rawToken);
  const user = await User.findOne({ verificationTokenHash: tokenHash });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or already used verification token' });
  }
  if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
    user.verificationTokenHash = null;
    user.verificationTokenExpires = null;
    await user.save();
    return res.status(410).json({ message: 'Verification token has expired. Please request a new one.' });
  }

  user.isVerified = true;
  user.verificationTokenHash = null;
  user.verificationTokenExpires = null;
  await user.save();

  res.json({ message: 'Email verified successfully. You can now log in.' });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: 'If an account exists for that email, a new verification link has been sent.' });
  }
  if (user.isVerified) {
    return res.status(200).json({ message: 'If an account exists for that email, a new verification link has been sent.' });
  }

  const emailMode = await issueVerificationEmail(user);
  res.status(200).json({
    message: 'If an account exists for that email, a new verification link has been sent.',
    emailMode,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }
  const user = await User.findById(req.user._id);
  const match = await bcrypt.compare(currentPassword || '', user.password);
  if (!match) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated' });
});
