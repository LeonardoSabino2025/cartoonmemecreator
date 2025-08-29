/* JS/modules/left-panel/sliders-handler.js */

import { initialize as initGenderHandler } from './gender-handler.js';

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
    document.getElementById('mouth-size-module').innerHTML = createSliderHTML('mouth-size', 'Tamanho da Boca', 100, 600, 320, 'px');
    document.getElementById('eye-distance-module').innerHTML = createSliderHTML('eye-distance', 'Distância dos Olhos', 0, 150, 20, 'px'); // Começa com min 0
    document.getElementById('mouth-y-module').innerHTML = createSliderHTML('mouth-y', 'Distância Boca-Olhos (Vertical)', -150, 150, 20, 'px');

    const sliders = [
        { id: 'mouth-size', action: characterAPI.setMouthSize, unit: 'px' },
        { id: 'eye-distance', action: characterAPI.setEyeDistance, unit: 'px' },
        { id: 'mouth-y', action: characterAPI.setMouthYPosition, unit: 'px' }
    ];

    sliders.forEach(({ id, action, unit }) => {
        const slider = document.getElementById(`${id}-slider`);
        const valueSpan = document.getElementById(`${id}-value`);
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            valueSpan.textContent = `${value}${unit}`;
            action(value);
        });
    });

    // Lógica para ajustar o slider de distância dos olhos
    const eyeDistanceSlider = document.getElementById('eye-distance-slider');
    
    // Escuta o evento personalizado que o gender-handler vai disparar
    document.addEventListener('genderChanged', (event) => {
        const gender = event.detail.gender;
        if (gender === 'female') {
            // Permite que os olhos se aproximem mais (até se sobreporem)
            eyeDistanceSlider.min = "-50";
        } else {
            // Volta ao padrão para o masculino
            eyeDistanceSlider.min = "0";
            // Se o valor atual for negativo, reseta para 0 para não bugar
            if (parseInt(eyeDistanceSlider.value) < 0) {
                eyeDistanceSlider.value = 0;
                eyeDistanceSlider.dispatchEvent(new Event('input')); // Dispara o evento para atualizar a tela
            }
        }
    });
}