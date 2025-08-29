/* JS/modules/right-panel/expression-handler.js */

import audioPlayer from '../playback-panel/audio-player.js';

function renderMarkers(timeline, container) {
    container.innerHTML = ''; // Limpa a lista
    timeline.forEach(marker => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="marker-time">${marker.time.toFixed(2)}s</span>
            <span class="marker-value">${marker.value}</span>
            <button class="marker-delete-btn" data-time="${marker.time}">X</button>
        `;
        container.appendChild(li);
    });
}

export function initialize(characterAPI, timelineController) {
    const container = document.getElementById('expression-module');
    container.innerHTML = `
        <h3>Expressão dos Olhos</h3>
        <div class="icon-buttons-container" id="expression-keyframe-buttons">
            <button class="icon-button" data-expression="happy" title="Marcar: Feliz">😄</button>
            <button class="icon-button" data-expression="sad" title="Marcar: Triste">😢</button>
            <button class="icon-button" data-expression="angry" title="Marcar: Raiva">😠</button>
            <button class="icon-button" data-expression="suspicious" title="Marcar: Desconfiado">🤨</button>
            <button class="icon-button" data-expression="curious" title="Marcar: Curioso">🤔</button>
        </div>
        <ul id="expression-timeline-markers" class="timeline-markers-list"></ul>
    `;

    const buttons = container.querySelector('#expression-keyframe-buttons');
    const markersList = container.querySelector('#expression-timeline-markers');

    buttons.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const expression = button.dataset.expression;
        const currentTime = audioPlayer.getCurrentTime();

        // Adiciona o keyframe ao controlador da timeline
        timelineController.addKeyframe('expression', currentTime, expression);
        
        // Aplica a expressão no personagem em tempo real
        characterAPI.setExpression(expression);
    });
    
    // Ouve o evento de atualização da timeline para redesenhar a lista de marcadores
    document.addEventListener('timelineUpdated', (e) => {
        if (e.detail.type === 'expression') {
            renderMarkers(e.detail.timelines.expression, markersList);
        }
    });
}