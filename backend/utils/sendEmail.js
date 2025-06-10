const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'kknwork0@gmail.com',
        pass: process.env.EMAIL_PASS || 'avgwopyntqgalsoz',

    }
});

const sendVerificationEmail = async (user) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30m' });
    const verificationLink = `${process.env.BASE_URL || 'http://localhost:3000'}/verify/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Verify Your Email',
        html: `<h1>Welcome, ${user.name}!</h1>
               <p>Click the link below to verify your email:</p>
               <a href="${verificationLink}">Verify Email</a>
               <p>This link will expire in 30 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
};

const sendResetPasswordEmail = async (user, token) => {
    try {
        const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Reset Your Password',
            html: `<h1>Reset Your Password</h1>
                   <p>Hi ${user.name},</p>
                   <p>Click the link below to reset your password:</p>
                   <a href="${resetLink}">${resetLink}</a>
                   <p>If you did not request this, please ignore this email.</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log('Reset password email sent successfully');
    } catch (error) {
        console.error('Error sending reset password email:', error);
        throw new Error('Failed to send reset password email');
    }
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
