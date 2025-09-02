/* JS/modules/right-panel/face-expression-handler.js */

import { expressionPresets } from '../character/expression-presets.js';
import * as timelineController from '../timeline-controller.js';
import audioPlayer from '../playback-panel/audio-player.js';
import { setAnimationMode, setSensitivity } from '../character/character-state.js';

function render(container) {
    let buttonsHTML = '';
    for (const key in expressionPresets) {
        const preset = expressionPresets[key];
        buttonsHTML += `<button class="icon-button" data-expression-key="${key}" title="${preset.label}">${preset.emoji}</button>`;
    }

    container.innerHTML = `
        <h2 class="panel-title">Animação</h2>
        
        <div class="control-group">
            <h3>Expressão do Rosto</h3>
            <div class="icon-buttons-container" id="expression-buttons">
                ${buttonsHTML}
            </div>
            <ul id="face-expression-markers" class="timeline-markers-list"></ul>
        </div>
        
        <div class="control-group">
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
        </div>
    `;
}

function mapSensitivityValueToLabel(value) {
    const numericValue = parseInt(value, 10);
    if (numericValue < 34) return 'Baixo';
    if (numericValue < 67) return 'Médio';
    return 'Alto';
}

export function initialize(characterAPI) {
    const container = document.getElementById('right-panel');
    render(container);

    const expressionButtons = container.querySelector('#expression-buttons');
    const markersList = container.querySelector('#face-expression-markers');
    const modeToggle = container.querySelector('#animation-mode-toggle');
    const sensitivityContainer = container.querySelector('#sensitivity-container');
    const sensitivitySlider = container.querySelector('#sensitivity-slider');
    const sensitivityValue = container.querySelector('#sensitivity-value');

    expressionButtons.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;
        const key = button.dataset.expressionKey;
        const currentTime = audioPlayer.getCurrentTime();
        timelineController.addKeyframe('faceExpression', currentTime, key);
        characterAPI.setFaceExpression(key);
    });

    modeToggle.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;
        modeToggle.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const mode = button.dataset.mode;
        setAnimationMode(mode);
        sensitivityContainer.classList.toggle('disabled', mode === 'manual');
    });
    
    sensitivitySlider.addEventListener('input', e => {
        const value = e.target.value;
        setSensitivity(value);
        sensitivityValue.textContent = mapSensitivityValueToLabel(value);
    });

    document.addEventListener('timelineUpdated', e => {
        if (e.detail.type === 'faceExpression') {
            markersList.innerHTML = '';
            e.detail.timeline.forEach(marker => {
                const preset = expressionPresets[marker.value];
                const li = document.createElement('li');
                li.innerHTML = `<span class="marker-time">${marker.time.toFixed(2)}s</span> <span class="marker-value">${preset.label}</span>`;
                markersList.appendChild(li);
            });
        }
    });
}