import nodemailer from 'nodemailer'
import mailerConfig from './mailerConfig.js';

const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport(mailerConfig);
    return transporter.sendMail({
        from: '"Your boss" <admin@mail.com>', // sender address
        to, // list of receivers
        subject,
        html,
    });

}
export default sendEmail;