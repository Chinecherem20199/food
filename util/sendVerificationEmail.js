import mail from "../config/emailg.js";

export const sendVerificationEmail = async(email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const data = {
    from: "Food App <no-reply@yourdomain.com>",
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `,
  };
  await mail.messages.create(process.env.MAILGUN_DOMAIN, data);
  //await mail.messages().send(data);
};