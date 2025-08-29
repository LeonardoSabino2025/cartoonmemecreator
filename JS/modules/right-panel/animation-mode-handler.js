/* JS/modules/right-panel/animation-mode-handler.js */

import { setAnimationMode, setSensitivity } from '../character/character-state.js';

/**
 * Mapeia o valor numérico do slider para um rótulo de texto.
 * @param {number} value - O valor de 0 a 100.
 * @returns {string} - O rótulo correspondente ('Baixo', 'Médio', 'Alto').
 */
function mapSensitivityValueToLabel(value) {
    const numericValue = parseInt(value, 10);
    if (numericValue < 34) return 'Baixo';
    if (numericValue < 67) return 'Médio';
    return 'Alto';
}

export function initialize(timelineController) {
    const container = document.getElementById('animation-mode-module');
    // O HTML agora inclui o slider de sensibilidade com os novos textos e valores
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

    // Listener para o slider de sensibilidade
    sensitivitySlider.addEventListener('input', (e) => {
        const value = e.target.value;
        setSensitivity(value);
        sensitivityValue.textContent = mapSensitivityValueToLabel(value);
    });

    // Listener para os botões Auto/Manual
    toggle.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        toggle.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const mode = button.dataset.mode;
        setAnimationMode(mode);

        if (mode === 'manual') {
            sensitivityContainer.classList.add('disabled');
        } else {
            sensitivityContainer.classList.remove('disabled');
        }
    });
}