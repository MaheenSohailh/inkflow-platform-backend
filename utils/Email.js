import nodemailer from 'nodemailer';

const _sendEmail = async (body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASWD
      }
    });

    await transporter.sendMail({
      from: `Developer Lab <${process.env.APP_EMAIL}>`,
      ...body
    })

    console.log('Email sent ');


  } catch (error) {
    console.log(`ERROR while sending email : `, error);
  }
}

export default _sendEmail;