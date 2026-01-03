const SUPABASE_URL = 'https://lltyjrwqzcfexfrsozto.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdHlqcndxemNmZXhmcnNvenRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzg0MTAsImV4cCI6MjA4MjYxNDQxMH0.pmP2x-yD6Xv2dv45T-CzzZ8nFDo7r7VKW5746uNepq8';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!name || !email || !password) {
        alert('Por favor, rellena todos los campos.');
        return;
    }

    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    const button = e.target.querySelector('button');
    button.disabled = true;
    button.textContent = 'Registrando...';

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: name
            }
        }
    });

    if (error) {
        alert('Error en el registro: ' + error.message);
        button.disabled = false;
        button.textContent = 'Registrarse';
    } else {
        alert('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta (si la verificación está activada). Redirigiendo al inicio de sesión...');
        window.location.href = 'login.html';
    }
});
