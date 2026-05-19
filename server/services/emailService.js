import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  if (!process.env.SMTP_HOST) {
    console.log('\n========================================================');
    console.log('📧 [MOCK EMAIL] NO SMTP CONFIGURED. MESSAGE CAPTURED:');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('========================================================\n');
    return { messageId: 'mock-id' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'SaaSHub'} <${process.env.FROM_EMAIL || 'noreply@saashub.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  return await transporter.sendMail(message);
};
