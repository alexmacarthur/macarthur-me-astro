import nodemailer from "nodemailer";

class EmailService {
  transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: import.meta.env.EMAIL_PROVIDER,
      auth: {
        user: import.meta.env.EMAIL_ADDRESS,
        pass: import.meta.env.EMAIL_PASSWORD,
      },
    });
  }

  transport(options) {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(options, function (error, info) {
        if (error) {
          return reject(error);
        }

        return resolve(info.response);
      });
    });
  }
}

export default EmailService;
