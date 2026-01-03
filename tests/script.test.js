/**
 * @jest-environment jsdom
 */

const { initAccordion, initForm } = require('../script.js');

describe('script.js', () => {
    describe('initAccordion', () => {
        beforeEach(() => {
            // Setup DOM
            document.body.innerHTML = `
                <ul class="accordion">
                    <li>
                        <button class="accordion-trigger">Question</button>
                        <div class="accordion-content">Answer</div>
                    </li>
                </ul>
            `;
        });

        it('should toggle active class and set maxHeight on click', () => {
            initAccordion();

            const trigger = document.querySelector('.accordion-trigger');
            const li = trigger.parentElement;
            const content = trigger.nextElementSibling;

            // Mock scrollHeight
            Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 100 });

            // Click to open
            trigger.click();
            expect(li.classList.contains('active')).toBe(true);
            expect(content.style.maxHeight).toBe('100px');

            // Click to close
            trigger.click();
            expect(li.classList.contains('active')).toBe(false);
            expect(content.style.maxHeight).toBe(''); // or null, usually style.maxHeight='' removes inline style
        });
    });

    describe('initForm', () => {
        let heroSubmit, heroEmail, alertMock, fetchMock;

        beforeEach(() => {
            document.body.innerHTML = `
                <input type="email" id="hero-email" value="">
                <button id="hero-submit">Empezar</button>
            `;
            heroSubmit = document.getElementById('hero-submit');
            heroEmail = document.getElementById('hero-email');

            alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });
            fetchMock = jest.fn();
            global.fetch = fetchMock;
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should alert if email is empty', () => {
            initForm();
            heroSubmit.click();
            expect(alertMock).toHaveBeenCalledWith('Por favor, introduce una dirección de correo.');
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('should alert if email is invalid', () => {
            initForm();
            heroEmail.value = 'invalid-email';
            heroSubmit.click();
            expect(alertMock).toHaveBeenCalledWith('Por favor, introduce una dirección de correo válida.');
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('should send email if valid', async () => {
            initForm();
            heroEmail.value = 'test@example.com';

            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({ message: 'Correo de bienvenida enviado y guardado correctamente' })
            });

            await heroSubmit.click();

            expect(heroSubmit.textContent).toBe('Enviando...');
            expect(heroSubmit.disabled).toBe(true);
            expect(fetchMock).toHaveBeenCalledWith('/api/send-welcome-email', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' })
            }));

            // Wait for promise resolution
            await new Promise(process.nextTick);

            expect(alertMock).toHaveBeenCalledWith('¡Éxito!: Correo de bienvenida enviado y guardado correctamente');
            expect(heroEmail.value).toBe('');
            expect(heroSubmit.textContent).toBe('Empezar');
            expect(heroSubmit.disabled).toBe(false);
        });

        it('should handle API errors', async () => {
            initForm();
            heroEmail.value = 'test@example.com';

            fetchMock.mockResolvedValue({
                ok: false,
                json: async () => ({ error: 'Error del servidor' })
            });

            await heroSubmit.click();
            await new Promise(process.nextTick);

            expect(alertMock).toHaveBeenCalledWith('Error: Error del servidor');
        });
    });
});
