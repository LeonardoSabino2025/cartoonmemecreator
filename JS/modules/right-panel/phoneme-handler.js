/* JS/modules/right-panel/phoneme-handler.js */

import audioPlayer from '../playback-panel/audio-player.js';

/**
 * Desenha a lista de marcadores de keyframe na tela.
 * @param {Array} timeline - O array de keyframes de fonema.
 * @param {HTMLElement} container - O elemento <ul> onde a lista será renderizada.
 */
function renderMarkers(timeline, container) {
    container.innerHTML = ''; // Limpa a lista antes de redesenhar
    timeline.forEach(marker => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="marker-time">${marker.time.toFixed(2)}s</span>
            <span class="marker-value">Fonema "${marker.value.toUpperCase()}"</span>
            <button class="marker-delete-btn" data-time="${marker.time}">X</button>
        `;
        container.appendChild(li);
    });
}

export function initialize(characterAPI, timelineController) {
    const container = document.getElementById('phoneme-module');
    container.innerHTML = `
        <h3>Fonemas (Modo Manual)</h3>
        <div class="phoneme-buttons">
            <button class="phoneme-button" data-phoneme="a">A</button>
            <button class="phoneme-button" data-phoneme="o">O</button>
            <button class="phoneme-button" data-phoneme="e">E</button>
            <button class="phoneme-button" data-phoneme="i">I/V/F</button>
            <button class="phoneme-button" data-phoneme="u">U</button>
            <button class="phoneme-button" data-phoneme="m">M/B/P</button>
            <button class="phoneme-button" data-phoneme="ch">CH/S/T</button>
            <button class="phoneme-button" data-phoneme="l">L</button>
            <button class="phoneme-button" data-phoneme="r">R</button>
            <button class="phoneme-button" data-phoneme="feliz">Humor</button>
        </div>
        <ul id="phoneme-timeline-markers" class="timeline-markers-list"></ul>
    `;
    
    // Esconde o painel por padrão, ele só aparece no modo manual
    container.style.display = 'none';

    const buttonsContainer = container.querySelector('.phoneme-buttons');
    const markersList = container.querySelector('#phoneme-timeline-markers');

    // Adiciona um keyframe ao clicar em um botão de fonema
    buttonsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const phoneme = button.dataset.phoneme;
        const currentTime = audioPlayer.getCurrentTime();

        timelineController.addKeyframe('phoneme', currentTime, phoneme);
        characterAPI.setMouth(phoneme); // Feedback visual imediato
    });
    
    // Ouve o evento de atualização da timeline para redesenhar a lista
    document.addEventListener('timelineUpdated', (e) => {
        if (e.detail.type === 'phoneme') {
            renderMarkers(e.detail.timelines.phoneme, markersList);
        }
    });

    // Ouve o evento de mudança de modo para se mostrar ou esconder
    document.addEventListener('animationModeChanged', (e) => {
        const mode = e.detail.mode;
        container.style.display = mode === 'manual' ? 'block' : 'none';
    });
}