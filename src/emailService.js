/**
 * @fileoverview Email service module using Nodemailer.
 * Handles the configuration of the transporter and sending of emails.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Nodemailer transporter instance configured with environment variables.
 * For production, consider using secure: true and port 465.
 * @type {nodemailer.Transporter}
 */
const transporter = nodemailer.createTransport({
    service: 'gmail', // Change this to your preferred service or use host/port
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a welcome email to the specified recipient.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} [name='User'] - The recipient's name (optional).
 * @returns {Promise<Object>} - The info object from nodemailer containing response details.
 * @throws {Error} If sending the email fails.
 */
async function sendEmail(email, name = 'Usuario') {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '¡Te damos la bienvenida a nuestro servicio!',
        text: `Hola ${name},\n\n¡Te damos la bienvenida a nuestra plataforma! Estamos encantados de tenerte con nosotros.\n\nAtentamente,\nEl equipo`,
        html: `<h1>Hola ${name},</h1><p>¡Te damos la bienvenida a nuestra plataforma! Estamos encantados de tenerte con nosotros.</p><p>Atentamente,<br>El equipo</p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = { sendEmail, transporter };
