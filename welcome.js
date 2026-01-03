const SUPABASE_URL = 'https://lltyjrwqzcfexfrsozto.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdHlqcndxemNmZXhmcnNvenRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzg0MTAsImV4cCI6MjA4MjYxNDQxMH0.pmP2x-yD6Xv2dv45T-CzzZ8nFDo7r7VKW5746uNepq8';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUserProfile = null;

async function checkSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error || !session) {
        window.location.href = 'login.html';
        return;
    }

    // Display user name or email
    const user = session.user;
    const nameDisplay = document.getElementById('user-name');
    nameDisplay.textContent = user.user_metadata.full_name || user.email;

    // Fetch user profile info (user_type)
    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

    if (profile) {
        currentUserProfile = profile;
        const typeDisplay = document.createElement('p');
        typeDisplay.innerHTML = `Tipo de cuenta: <strong>${profile.user_type.toUpperCase()}</strong>`;
        typeDisplay.style.color = '#e50914'; // Netflix Red
        document.querySelector('.welcome-content').appendChild(typeDisplay);
    }

    // Check if user is verified
    if (!user.email_confirmed_at) {
        document.getElementById('verify-banner').style.display = 'block';
    }
}

document.getElementById('explore-btn').addEventListener('click', (e) => {
    if (!currentUserProfile || currentUserProfile.user_type !== 'premium') {
        e.preventDefault();
        alert('⚠️ Lo sentimos, esta sección es exclusiva para usuarios PREMIUM. ¡Actualiza tu plan para acceder!');
    }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        alert('Error al cerrar sesión: ' + error.message);
    } else {
        window.location.href = 'login.html';
    }
});

// Run session check on load
checkSession();
