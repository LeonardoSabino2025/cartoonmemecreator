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
            <button id="volume-toggle-btn" title="Volume" style="width: 40px; height: 40px; font-size: 1.5rem; color: var(--cor-texto); background-color: transparent; border: none; cursor: pointer;">
                🔊
            </button>
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
    // Verifica se todos os elementos foram encontrados
    if (!dom.playPauseBtn || !dom.toStartBtn || !dom.toEndBtn || !dom.rewindBtn || !dom.forwardBtn || !dom.timelineSlider || !dom.volumeToggleBtn) {
        console.error("Um ou mais elementos do painel de playback não foram encontrados.");
        return;
    }

    // --- Controles de playback ---
    dom.playPauseBtn.addEventListener('click', () => {
        audioPlayer.isPlaying() ? audioPlayer.pause() : audioPlayer.play();
    });
    dom.toStartBtn.addEventListener('click', () => audioPlayer.seek(0));
    dom.toEndBtn.addEventListener('click', () => audioPlayer.seek(audioPlayer.getDuration()));
    dom.rewindBtn.addEventListener('click', () => audioPlayer.seek(audioPlayer.getCurrentTime() - 2));
    dom.forwardBtn.addEventListener('click', () => audioPlayer.seek(audioPlayer.getCurrentTime() + 2));

    // --- Timeline: Arrasto em tempo real ---
    dom.timelineSlider.addEventListener('mousedown', () => { isScrubbing = true; });
    document.addEventListener('mouseup', () => { isScrubbing = false; });

    dom.timelineSlider.addEventListener('input', () => {
        const progress = dom.timelineSlider.value / 1000;
        const targetTime = audioPlayer.getDuration() * progress;
        dom.currentTime.textContent = audioPlayer.formatTime(targetTime);
        // Dispara evento personalizado para atualizar a agulha em tempo real
        document.dispatchEvent(new CustomEvent('timelineScrub', { detail: { progress: progress * 100 } }));
    });

    dom.timelineSlider.addEventListener('change', () => {
        const progress = dom.timelineSlider.value / 1000;
        const targetTime = audioPlayer.getDuration() * progress;
        audioPlayer.seek(targetTime);
    });

    // --- Controle de volume ---
    dom.volumeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const volumePanel = document.getElementById('volume-panel');
        if (!volumePanel) return;

        // Alterna visibilidade do panel de volume
        volumePanel.style.display = volumePanel.style.display === 'block' ? 'none' : 'block';
    });

    // --- Evento para fechar o volume quando clicar fora ---
    document.addEventListener('click', (e) => {
        const volumePanel = document.getElementById('volume-panel');
        if (volumePanel && !volumePanel.contains(e.target) && e.target !== dom.volumeToggleBtn) {
            volumePanel.style.display = 'none';
        }
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

export function initialize() {
    const container = document.getElementById('playback-panel');
    if (!container) {
        console.error("Container do painel de playback (#playback-panel) não foi encontrado no HTML.");
        return;
    }

    render(container);

    // Atribui os elementos ao objeto dom
    dom.toStartBtn = container.querySelector('#to-start-btn');
    dom.rewindBtn = container.querySelector('#rewind-btn');
    dom.playPauseBtn = container.querySelector('#play-pause-btn');
    dom.forwardBtn = container.querySelector('#forward-btn');
    dom.toEndBtn = container.querySelector('#to-end-btn');
    dom.timelineSlider = container.querySelector('#timeline-slider');
    dom.currentTime = container.querySelector('#current-time');
    dom.totalDuration = container.querySelector('#total-duration');
    dom.volumeToggleBtn = container.querySelector('#volume-toggle-btn');
    dom.allControls = container.querySelectorAll('button, input');
    dom.markersContainer = container.querySelector('#timeline-markers-container');

    setupEventListeners();
    dom.allControls.forEach(el => { el.disabled = true; });
}