/* JS/modules/left-panel/sliders-handler.js */

import { setSensitivity } from '../character/character-state.js';
import * as characterAPI from '../character/character-api.js';

function createSliderHTML(id, label, min, max, value, unit) {
    return `
        <h3>${label}</h3>
        <div class="slider-container">
            <input type="range" id="${id}-slider" min="${min}" max="${max}" value="${value}">
            <span id="${id}-value">${value}${unit}</span>
        </div>
    `;
}

export function initialize(characterAPI) {
    // Injeta o HTML apenas para os sliders que PERMANECEM no painel esquerdo
    document.getElementById('mouth-size-module').innerHTML = createSliderHTML('mouth-size', 'Tamanho da Boca', 100, 600, 320, 'px');
    document.getElementById('eye-distance-module').innerHTML = createSliderHTML('eye-distance', 'Distância dos Olhos', 0, 150, 20, 'px');
    document.getElementById('mouth-y-module').innerHTML = createSliderHTML('mouth-y', 'Distância Boca-Olhos (Vertical)', -150, 150, 20, 'px');

    // Mapeia apenas os sliders restantes às suas funções
    const sliders = [
        { id: 'mouth-size',    action: characterAPI.setMouthSize,    unit: 'px' },
        { id: 'eye-distance',  action: characterAPI.setEyeDistance,  unit: 'px' },
        { id: 'mouth-y',       action: characterAPI.setMouthYPosition, unit: 'px' }
    ];

    // Adiciona um listener genérico para estes sliders
    sliders.forEach(({ id, action, unit }) => {
        const slider = document.getElementById(`${id}-slider`);
        const valueSpan = document.getElementById(`${id}-value`);
        
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            valueSpan.textContent = `${value}${unit}`;
            action(value);

        });
    });

    // A lógica para ajustar o limite do slider de distância dos olhos continua aqui
    const eyeDistanceSlider = document.getElementById('eye-distance-slider');
    document.addEventListener('genderChanged', (event) => {
        const gender = event.detail.gender;
        if (gender === 'female') {
            eyeDistanceSlider.min = "-50";
        } else {
            eyeDistanceSlider.min = "0";
            if (parseInt(eyeDistanceSlider.value) < 0) {
                eyeDistanceSlider.value = 0;
                eyeDistanceSlider.dispatchEvent(new Event('input'));
            }
        }
    });
}