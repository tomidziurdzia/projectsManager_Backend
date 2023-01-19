import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;
  // Enviando email
  const info = await transporter.sendMail({
    from: '"Administrador de Proyectos"', // sender address
    to: email, // list of receivers
    subject: "Comprueba tu cuenta", // Subject line
    text: "Comprueba tu cuenta", // plain text body
    html: `<p>Hola ${nombre}, comprueba tu cuenta en ProjectManager</p>
            <p>Tu cuenta ya esta lista, solo debes comprobarla en el siguiente enlace
              <a href="${process.env.FRONTEND_URL}/confirmar/${token}" >Comprobar cuenta</a>
            </p>
            <p>Si tu no creaste esta cuenta puedes ignorar este mensaje</p>
    `, // html body
  });

  // console.log("Message sent: %s", info.messageId);
};

export const emailOlvidePassword = async (datos) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;
  // Enviando email
  const info = await transporter.sendMail({
    from: '"Administrador de Proyectos"', // sender address
    to: email, // list of receivers
    subject: "Reestablece tu password", // Subject line
    text: "Comprueba tu cuenta", // plain text body
    html: `<p>Hola ${nombre}, has solicitado reestablecer tu password</p>
            <p>Sigue el siguiente enlace para generar un nuevo password
              <a href="${process.env.FRONTEND_URL}/olvide-password/${token}" >Reestablecer password</a>
            </p>
            <p>Si tu no solicitaste este email puedes ignorar este mensaje</p>
    `, // html body
  });

  // console.log("Message sent: %s", info.messageId);
};
