const nodemailer = require('nodemailer');

// Mock nodemailer before importing the service
jest.mock('nodemailer');

const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({
    sendMail: sendMailMock
});

const { sendEmail } = require('../src/emailService');

describe('emailService', () => {
    beforeEach(() => {
        sendMailMock.mockClear();
        sendMailMock.mockResolvedValue({ response: '250 OK' });
    });

    it('should send an email successfully', async () => {
        const info = await sendEmail('test@example.com', 'Usuario');

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@example.com',
            subject: '¡Te damos la bienvenida a nuestro servicio!',
            text: expect.stringContaining('Hola Usuario')
        }));
        expect(info.response).toBe('250 OK');
    });

    it('should throw an error if sending fails', async () => {
        const error = new Error('Network error');
        sendMailMock.mockRejectedValue(error);

        await expect(sendEmail('test@example.com')).rejects.toThrow('Network error');
    });
});
