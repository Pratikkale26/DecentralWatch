import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }: { to: string; subject: string; text: string }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // todo: Resend
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
};
