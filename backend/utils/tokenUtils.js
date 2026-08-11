import crypto from 'node:crypto';

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const VERIFICATION_TOKEN_EXPIRES_MS = 30 * 60 * 1000;
