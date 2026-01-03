const SUPABASE_URL = 'https://lltyjrwqzcfexfrsozto.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdHlqcndxemNmZXhmcnNvenRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzg0MTAsImV4cCI6MjA4MjYxNDQxMH0.pmP2x-yD6Xv2dv45T-CzzZ8nFDo7r7VKW5746uNepq8';

if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded.');
} else {
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    const nav = document.querySelector('.browse-nav');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    async function checkPremium() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error || !session) {
            window.location.href = 'login.html';
            return;
        }

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

        if (!profile || profile.user_type !== 'premium') {
            alert('Acceso denegado: Necesitas una cuenta PREMIUM.');
            window.location.href = 'welcome.html';
            return;
        }

        // If premium, load movies
        loadMovies();
    }

    async function loadMovies() {
        const { data: videos, error } = await supabaseClient
            .from('videos')
            .select('*');

        if (error) {
            console.error('Error fetching videos:', error);
            return;
        }

        renderVideos(videos, 'Tendencias actuales', 'trending-movies');
        renderVideos(videos, 'Series de suspenso', 'thriller-movies');

        setupBillboard(videos);
    }

    function setupBillboard(videos) {
        const playBtn = document.querySelector('.btn-play');
        const featuredMovie = videos.find(v => v.title === 'Antigravity: Rise');

        if (playBtn && featuredMovie) {
            playBtn.addEventListener('click', () => {
                window.location.href = `player.html?video=${encodeURIComponent(featuredMovie.video_url)}&title=${encodeURIComponent(featuredMovie.title)}`;
            });
        }
    }

    function renderVideos(videos, category, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const categoryVideos = videos.filter(v => v.category === category);
        container.innerHTML = ''; // Clear loading text

        if (categoryVideos.length === 0) {
            container.innerHTML = '<p style="padding: 20px;">No hay videos disponibles en esta categoría.</p>';
            return;
        }

        categoryVideos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="${video.thumbnail_url}" alt="${video.title}">
                <div class="movie-info-overlay">${video.title}</div>
            `;

            card.addEventListener('click', () => {
                window.location.href = `player.html?video=${encodeURIComponent(video.video_url)}&title=${encodeURIComponent(video.title)}`;
            });

            container.appendChild(card);
        });
    }

    // Run on load
    checkPremium();
}
