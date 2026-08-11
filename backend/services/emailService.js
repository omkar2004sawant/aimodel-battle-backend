import { google } from "googleapis";

export async function sendVerificationEmail({ to, verificationUrl }) {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN,
    EMAIL_FROM,
  } = process.env;

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN,
  });

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const subject = "Verify your email — AI Model Battle";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2>Welcome to AI Model Battle</h2>

      <p>Please verify your email address to activate your account.</p>

      <a href="${verificationUrl}"
         style="display:inline-block;padding:12px 24px;background:#06b6d4;color:#06080c;text-decoration:none;border-radius:8px;font-weight:600;">
        Verify Email
      </a>

      <p style="font-size:13px;">
        This link expires in 30 minutes.
      </p>
    </div>
  `;

  const message = [
    `From: AI Model Battle <${EMAIL_FROM}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ].join("\r\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64url");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return {
    mode: "gmail-api",
    id: response.data.id,
  };
}