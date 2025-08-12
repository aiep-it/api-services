const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Gửi email chung; nếu chưa cấu hình RESEND_API_KEY thì không làm gì
async function sendEmail({ to, subject, html }) {
  if (!resend) return;
  await resend.emails.send({
    from: process.env.MAIL_FROM || 'no-reply@your-domain.com',
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
