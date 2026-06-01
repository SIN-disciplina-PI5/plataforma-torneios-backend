import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendResetPasswordEmail = async (email, resetToken) => {
  const mailOptions = {
    from: `"Arena Lagoa Beach" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Código de Recuperação de Senha",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2FA026;">Recuperação de Senha</h2>
        <p>Você solicitou a redefinição da sua senha.</p>
        <p>Seu código de verificação é:</p>
        <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background-color: #f0f0f0; border-radius: 5px; letter-spacing: 5px;">
          ${resetToken}
        </div>
        <p>Este código é válido por <strong>1 hora</strong>.</p>
        <p>Digite este código no aplicativo para redefinir sua senha.</p>
        <hr />
        <small>Se você não solicitou esta alteração, ignore este email.</small>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};