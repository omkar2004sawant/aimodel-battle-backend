import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

  if (EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: Number(EMAIL_PORT) === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
    return { transporter, mode: 'smtp', from: EMAIL_FROM || EMAIL_USER };
  }

  return { transporter: null, mode: 'console', from: EMAIL_FROM || 'no-reply@aimodelbattle.local' };
}

export async function sendVerificationEmail({ to, verificationUrl }) {
  const { transporter, mode, from } = getTransporter();

  const subject = 'Verify your email — AI Model Battle';
  const text = `Welcome to AI Model Battle!\n\nPlease verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link expires in 30 minutes.\n\nIf you did not create an account, you can safely ignore this email.`;
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0b0e14;">Welcome to AI Model Battle</h2>
      <p style="color: #525c72; line-height: 1.6;">Please verify your email address to activate your account.</p>
      <a href="${verificationUrl}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background-color: #06b6d4; color: #06080c; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify Email</a>
      <p style="color: #8590a8; font-size: 13px; line-height: 1.5;">This link expires in 30 minutes. If you did not create an account, you can safely ignore this email.</p>
    </div>`;

  if (mode === 'smtp' && transporter) {
    await transporter.sendMail({ from, to, subject, text, html });
    return { mode: 'smtp' };
  }

  console.log('\n────────────────────────────────────────');
  console.log('  EMAIL VERIFICATION (console fallback)');
  console.log('────────────────────────────────────────');
  console.log(`  To:  ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Verification URL: ${verificationUrl}`);
  console.log('────────────────────────────────────────\n');
  return { mode: 'console' };
}
