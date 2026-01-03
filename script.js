/**
 * @fileoverview Frontend logic for the Netflix Clone landing page.
 * Handles the accordion functionality for the FAQ section and the
 * API integration for the "Get Started" email submission.
 */

/**
 * Initializes the accordion functionality.
 */
function initAccordion() {
    const acc = document.getElementsByClassName('accordion-trigger');

    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener('click', function () {
            // Toggle the 'active' class on the li parent
            this.parentElement.classList.toggle('active');

            // Toggle the panel visibility
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    }
}

/**
 * Initializes the form submission logic.
 */
function initForm() {
    /** @type {HTMLElement} */
    const heroSubmit = document.getElementById('hero-submit');
    /** @type {HTMLInputElement} */
    const heroEmail = document.getElementById('hero-email');

    if (heroSubmit && heroEmail) {
        /**
         * Event listener for the "Get Started" button click.
         */
        heroSubmit.addEventListener('click', async () => {
            const email = heroEmail.value;

            if (!email) {
                alert('Por favor, introduce una dirección de correo.');
                return;
            }

            // Validate email simple regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, introduce una dirección de correo válida.');
                return;
            }

            const originalText = heroSubmit.innerHTML;
            heroSubmit.textContent = 'Enviando...';
            heroSubmit.disabled = true;

            try {
                const response = await fetch('/api/send-welcome-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('¡Éxito!: ' + data.message);
                    heroEmail.value = ''; // Clear input
                } else {
                    alert('Error: ' + (data.error || 'No se pudo enviar el correo'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Ocurrió un error al enviar el correo.');
            } finally {
                heroSubmit.innerHTML = originalText;
                heroSubmit.disabled = false;
            }
        });
    }
}

// Execute logic if running in browser
if (typeof module === 'undefined') {
    initAccordion();
    initForm();
} else {
    // Export for testing
    module.exports = { initAccordion, initForm };
}
