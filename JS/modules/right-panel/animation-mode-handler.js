/* JS/modules/right-panel/animation-mode-handler.js */

export function initialize(timelineController) {
    const container = document.getElementById('animation-mode-module');
    container.innerHTML = `
        <h3>Modo de Animação da Boca</h3>
        <div class="segmented-control" id="animation-mode-toggle">
            <button data-mode="auto" class="active">Automático</button>
            <button data-mode="manual">Manual</button>
        </div>
    `;

    const toggle = container.querySelector('#animation-mode-toggle');
    toggle.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        toggle.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const mode = button.dataset.mode;
        // Dispara um evento global para que outros módulos (como o de fonemas) possam reagir
        const event = new CustomEvent('animationModeChanged', { detail: { mode } });
        document.dispatchEvent(event);
    });
}