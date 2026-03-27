const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (toEmail, resetLink) => {
  await transporter.sendMail({
    from: `"BlinkLearn" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password. 
         This link expires in <b>15 minutes</b>.</p>
      <a href="${resetLink}" 
         style="padding:10px 20px; background:#6c63ff; 
                color:white; border-radius:5px; 
                text-decoration:none;">
        Reset Password
      </a>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
};

module.exports = { sendResetEmail };