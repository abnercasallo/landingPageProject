// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: () => ({
            insert: jest.fn().mockResolvedValue({ error: null })
        })
    })
}));

const request = require('supertest');
const app = require('../src/server');
const { sendEmail } = require('../src/emailService');

// Mock the emailService to avoid actual emails
jest.mock('../src/emailService', () => ({
    sendEmail: jest.fn()
}));

describe('POST /api/send-welcome-email', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and success message when email is sent', async () => {
        sendEmail.mockResolvedValue({ response: '250 OK' });

        const res = await request(app)
            .post('/api/send-welcome-email')
            .send({ email: 'test@example.com', name: 'Tester' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: 'Correo de bienvenida enviado y guardado correctamente' });
        expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Tester');
    });

    it('should return 400 if email is missing', async () => {
        const res = await request(app)
            .post('/api/send-welcome-email')
            .send({ name: 'Tester' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: 'El correo electrónico es obligatorio' });
        expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should return 500 if email service fails', async () => {
        sendEmail.mockRejectedValue(new Error('SMTP Error'));

        const res = await request(app)
            .post('/api/send-welcome-email')
            .send({ email: 'fail@example.com' });

        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ error: 'No se pudo procesar la solicitud' });
    });
});
