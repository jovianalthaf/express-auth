const mailerConfig = {
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: "847df4bcdbd567",
        pass: "0bb8a8101a9420",
    },
};
export default mailerConfig;
// using nodemailer for production/gmail
// const gmail = nodemailer.createTransport({
//     host: "gmail",
//     auth: {
//         user: "your-email@gmail.com",
//         pass: "your-email-password",
//     },
// });