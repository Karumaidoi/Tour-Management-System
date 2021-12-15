const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user;
    this.url = url;
    this.firstname = user.name.split(' ')[0];
    this.from = `Alex Maina <${process.env.NODE_ENV.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }

    return nodemailer.createTransport({
      // service: 'Gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //Render the HTML content to be sent to our Email
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });
    //Mail Options
    const mailOpti0ns = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    //Create a transport and send emails
    //Send the email Actually
    await this.newTransport().sendMail(mailOpti0ns);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to Bestypie Kenya');
  }

  async sendResetPassword() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 mins)'
    );
  }
};
