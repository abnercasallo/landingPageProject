const SUPABASE_URL = 'https://lltyjrwqzcfexfrsozto.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdHlqcndxemNmZXhmcnNvenRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzg0MTAsImV4cCI6MjA4MjYxNDQxMH0.pmP2x-yD6Xv2dv45T-CzzZ8nFDo7r7VKW5746uNepq8';
if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded. Check your internet connection or CDN link.');
} else {
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');
        const button = e.target.querySelector('button');

        // Hide previous errors
        errorDiv.style.display = 'none';

        if (!email || !password) {
            showError('Por favor, rellena todos los campos.');
            return;
        }

        button.disabled = true;
        button.textContent = 'Iniciando sesión...';

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Login error:', error);
                if (error.message.includes('Email not confirmed')) {
                    showError('Tu cuenta no está verificada. Por favor, revisa tu correo electrónico para confirmar tu cuenta.', true);
                } else if (error.message.includes('Invalid login credentials')) {
                    showError('Correo o contraseña incorrectos. Inténtalo de nuevo.');
                } else {
                    showError('Error al iniciar sesión: ' + error.message);
                }
                button.disabled = false;
                button.textContent = 'Iniciar sesión';
            } else {
                // Redirect to welcome page
                window.location.href = 'welcome.html';
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            showError('Ocurrió un problema inesperado. Por favor, inténtalo más tarde.');
            button.disabled = false;
            button.textContent = 'Iniciar sesión';
        }
    });

    function showError(message, isVerificationError = false) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.innerHTML = message;
            if (isVerificationError) {
                const resendBtn = document.createElement('button');
                resendBtn.textContent = 'Reenviar enlace de verificación';
                resendBtn.style.display = 'block';
                resendBtn.style.marginTop = '10px';
                resendBtn.style.background = 'transparent';
                resendBtn.style.border = '1px solid white';
                resendBtn.style.color = 'white';
                resendBtn.style.padding = '5px 10px';
                resendBtn.style.cursor = 'pointer';
                resendBtn.style.borderRadius = '4px';

                resendBtn.onclick = async (e) => {
                    e.preventDefault();
                    resendBtn.disabled = true;
                    resendBtn.textContent = 'Enviando...';
                    const email = document.getElementById('email').value;
                    const { error } = await supabaseClient.auth.resend({
                        type: 'signup',
                        email: email,
                    });
                    if (error) {
                        alert('Error al reenviar: ' + error.message);
                        resendBtn.disabled = false;
                        resendBtn.textContent = 'Reenviar enlace de verificación';
                    } else {
                        alert('¡Enlace reenviado! Revisa tu bandeja de entrada.');
                        resendBtn.textContent = 'Enviado';
                    }
                };
                errorDiv.appendChild(resendBtn);
            }
            errorDiv.style.display = 'block';
        } else {
            alert(message);
        }
    }
}
