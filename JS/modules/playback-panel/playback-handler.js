/* JS/modules/playback-panel/playback-handler.js */

import audioPlayer from './audio-player.js';
import * as timelineController from '../timeline-controller.js';

const dom = {};
let isScrubbing = false;

/**
 * Cria e injeta o HTML do painel de playback no documento.
 */
function render(container) {
    container.innerHTML = `
        <div class="playback-controls">
            <button id="to-start-btn" title="Ir para o início">⏮️</button>
            <button id="rewind-btn" title="Voltar 2s">⏪</button>
            <button id="play-pause-btn" title="Play">▶️</button>
            <button id="forward-btn" title="Avançar 2s">⏩</button>
            <button id="to-end-btn" title="Ir para o final">⏭️</button>
        </div>
        <div class="timeline-wrapper">
            <div class="timeline-container">
                <div id="timeline-markers-container"></div>
                <input type="range" id="timeline-slider" min="0" max="1000" value="0">
            </div>
            <div class="time-display">
                <span id="current-time">00:00.00</span> / <span id="total-duration">00:00.00</span>
            </div>
        </div>
    `;
}

/**
 * Desenha os marcadores de keyframe na timeline de playback.
 */
function updateTimelineMarkers() {
    if (!dom.markersContainer) return;
    dom.markersContainer.innerHTML = '';
    const duration = audioPlayer.getDuration();
    if (duration === 0) return;

    const allKeyTimes = timelineController.getAllKeyframeTimes();

    allKeyTimes.forEach(time => {
        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        const percentage = (time / duration) * 100;
        marker.style.left = `${percentage}%`;
        dom.markersContainer.appendChild(marker);
    });
}

/**
 * Adiciona todos os listeners de eventos para os controles e para o player de áudio.
 */
function setupEventListeners() {
    dom.playPauseBtn.addEventListener('click', () => {
        audioPlayer.isPlaying() ? audioPlayer.pause() : audioPlayer.play();
    });
    dom.toStartBtn.addEventListener('click', () => audioPlayer.seek(0));
    dom.toEndBtn.addEventListener('click', () => audioPlayer.seek(audioPlayer.getDuration()));
    dom.rewindBtn.addEventListener('click', () => audioPlayer.seek(audioPlayer.getCurrentTime() - 2));
    dom.forwardBtn.addEventListener('click', () => audioPlayer.seek(audioPlayer.getCurrentTime() + 2));

    dom.timelineSlider.addEventListener('mousedown', () => { isScrubbing = true; });
    document.addEventListener('mouseup', () => { isScrubbing = false; });

    dom.timelineSlider.addEventListener('input', () => {
        const progress = dom.timelineSlider.value / 1000;
        const targetTime = audioPlayer.getDuration() * progress;
        dom.currentTime.textContent = audioPlayer.formatTime(targetTime);
    });
    
    dom.timelineSlider.addEventListener('change', () => {
        const progress = dom.timelineSlider.value / 1000;
        const targetTime = audioPlayer.getDuration() * progress;
        audioPlayer.seek(targetTime);
    });

    // --- Listeners para eventos do Player ---
    document.addEventListener('loaded', (e) => {
        dom.totalDuration.textContent = e.detail.formattedDuration;
        dom.allControls.forEach(el => { el.disabled = false; });
        updateTimelineMarkers();
    });

    document.addEventListener('statechange', (e) => {
        dom.playPauseBtn.textContent = e.detail.isPlaying ? '⏸️' : '▶️';
        dom.playPauseBtn.title = e.detail.isPlaying ? 'Pause' : 'Play';
    });
    

    document.addEventListener('unloaded', () => {
        dom.allControls.forEach(el => { el.disabled = true; });
        dom.timelineSlider.value = 0;
        dom.currentTime.textContent = '00:00.00';
        dom.totalDuration.textContent = '00:00.00';
        dom.playPauseBtn.textContent = '▶️';
        dom.playPauseBtn.title = 'Play';
        updateTimelineMarkers();
    });

    document.addEventListener('timelineUpdated', updateTimelineMarkers);
}

export function initialize(characterAPI) {
    const container = document.getElementById('playback-panel');
    if (!container) {
        console.error("Container do painel de playback (#playback-panel) não foi encontrado no HTML.");
        return;
    }

    render(container);

    dom.toStartBtn = container.querySelector('#to-start-btn');
    dom.rewindBtn = container.querySelector('#rewind-btn');
    dom.playPauseBtn = container.querySelector('#play-pause-btn');
    dom.forwardBtn = container.querySelector('#forward-btn');
    dom.toEndBtn = container.querySelector('#to-end-btn');
    dom.timelineSlider = container.querySelector('#timeline-slider');
    dom.currentTime = container.querySelector('#current-time');
    dom.totalDuration = container.querySelector('#total-duration');
    dom.allControls = container.querySelectorAll('button, input');
    dom.markersContainer = container.querySelector('#timeline-markers-container');
    
    setupEventListeners();
    dom.allControls.forEach(el => { el.disabled = true; });
}