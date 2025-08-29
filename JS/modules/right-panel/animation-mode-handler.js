/* JS/modules/right-panel/animation-mode-handler.js */

import { setAnimationMode } from '../character/character-state.js';

function mapSensitivityValueToLabel(value) {
    const numericValue = parseInt(value, 10);
    if (numericValue < 34) return 'Baixo';
    if (numericValue < 67) return 'Médio';
    return 'Alto';
}

export function initialize(timelineController) {
    const container = document.getElementById('animation-mode-module');
    container.innerHTML = `
        <h3>Modo de Animação da Boca</h3>
        <div class="segmented-control" id="animation-mode-toggle">
            <button data-mode="auto" class="active">Automático</button>
            <button data-mode="manual">Manual</button>
        </div>
        <div id="sensitivity-container">
            <div class="slider-container">
                <label for="sensitivity-slider" style="font-size: 0.9rem; color: var(--cor-texto-secundario); width: 100%;">Sensibilidade do Silêncio</label>
                <input type="range" id="sensitivity-slider" min="0" max="100" value="85">
                <span id="sensitivity-value">Alto</span>
            </div>
        </div>
    `;

    const toggle = container.querySelector('#animation-mode-toggle');
    const sensitivityContainer = container.querySelector('#sensitivity-container');
    const sensitivitySlider = container.querySelector('#sensitivity-slider');
    const sensitivityValue = container.querySelector('#sensitivity-value');

    sensitivitySlider.addEventListener('input', (e) => {
        const value = e.target.value;
        setSensitivity(value);
        sensitivityValue.textContent = mapSensitivityValueToLabel(value);
    });

    toggle.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        toggle.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const mode = button.dataset.mode;
        setAnimationMode(mode); // Define o estado central

        // ATUALIZAÇÃO: Dispara um evento para que outros módulos (como o de fonemas) possam reagir
        const event = new CustomEvent('animationModeChanged', { detail: { mode } });
        document.dispatchEvent(event);

        // Lógica para ativar/desativar o slider
        if (mode === 'manual') {
            sensitivityContainer.classList.add('disabled');
        } else {
            sensitivityContainer.classList.remove('disabled');
        }
    });
}