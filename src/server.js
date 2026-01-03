/**
 * @fileoverview Express server setup for the Netflix Clone application.
 * Defines the API endpoints and serves static files.
 */

require('dotenv').config(); // Ensure env vars are loaded
const express = require('express');
const { sendEmail } = require('./emailService');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../')));

/**
 * POST /api/send-welcome-email
 * Endpoint to send a welcome email to a new user and store it in Supabase.
 *
 * @name SendWelcomeEmail
 * @route {POST} /api/send-welcome-email
 * @bodyparam {string} email - The recipient's email address.
 * @bodyparam {string} [name] - The recipient's name (optional).
 */
app.post('/api/send-welcome-email', async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es obligatorio' });
    }

    try {
        // 1. Send Welcome Email
        await sendEmail(email, name);

        // 2. Store email in Supabase
        const { error: dbError } = await supabase
            .from('emails')
            .insert([{ email: email }]);

        if (dbError) {
            // If duplicate email or other DB error, log it but don't fail the whole request
            // since the email was sent (or decide behavior). 
            // For duplicates (UNIQUE constraint), it will error.
            console.error('Supabase Error:', dbError);
            if (dbError.code === '23505') { // Postgres unique violation code
                return res.status(200).json({ message: 'Correo de bienvenida enviado (Email ya suscrito)' });
            }
            // Proceeding anyway as email call succeeded
        }

        res.status(200).json({ message: 'Correo de bienvenida enviado y guardado correctamente' });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'No se pudo procesar la solicitud' });
    }
});

// Export app for testing purposes
module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
