/* JS/main.js */

import {startScreenRecording, stopScreenRecording, savePanelVisibility, hidePanels, restorePanels} from './modules/export/screen-recorder.js';
import { initialize as initializeCharacterAPI } from './modules/character/character-api.js';
import * as audioHandler from './modules/left-panel/audio-handler.js';
import * as genderHandler from './modules/left-panel/gender-handler.js';
import * as slidersHandler from './modules/left-panel/sliders-handler.js';
import { initialize as initializePlaybackHandler } from './modules/playback-panel/playback-handler.js';
import { initialize as initializeWaveformHandler } from './modules/playback-panel/waveform-handler.js';
import { initialize as initializeVolumeControl, closeVolumePanel } from './modules/playback-panel/volume-control.js';
import * as timelineController from './modules/timeline-controller.js';
import { initialize as initializeRightPanel } from './modules/right-panel/right-panel-handler.js';
import { initialize as initializeGazeHud } from './modules/stage/gaze-hud-handler.js';
import audioPlayer from './modules/playback-panel/audio-player.js';

function main() {
    const characterAPI = initializeCharacterAPI();

    // Inicializa todos os módulos do painel de playback
    initializePlaybackHandler();
    initializeWaveformHandler();
    initializeVolumeControl(); // inicializa o controle de volume

    // Inicializa outros módulos
    initializeRightPanel(characterAPI, timelineController);
    audioHandler.initialize();
    genderHandler.initialize(characterAPI);
    slidersHandler.initialize(characterAPI);
    initializeGazeHud(characterAPI, timelineController);

    // === BOTÃO FLUTUANTE "GERAR VÍDEO" ===
    const renderBtn = document.createElement('button');
    renderBtn.id = 'render-video-btn';
    renderBtn.innerHTML = '🎥';
    renderBtn.title = 'Gerar Vídeo';
    renderBtn.style.cssText = `
        position: fixed;
        bottom: 15px;
        right: 360px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: var(--cor-painel-fundo);
        color: white;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border: none;
    `;

    // Efeito de hover
    renderBtn.addEventListener('mouseenter', () => {
        renderBtn.style.transform = 'scale(1.1)';
        renderBtn.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
    });

    renderBtn.addEventListener('mouseleave', () => {
        renderBtn.style.transform = 'scale(1)';
        renderBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    });

    // Evento de clique
    renderBtn.addEventListener('click', async () => {
        if (!audioPlayer.getAudioBuffer()) {
            alert("⚠️ Carregue um áudio antes de gerar o vídeo.");
            return;
        }

        // Fecha o painel de volume antes de gerar o vídeo
        closeVolumePanel();

        // tenta obter contexto e gainNode com proteção
        const ctx = audioPlayer.getAudioContext ? audioPlayer.getAudioContext() : null;
        const monitorGain = audioPlayer.getGainNode ? audioPlayer.getGainNode() : null;
        const previousVolume = (monitorGain && monitorGain.gain) ? monitorGain.gain.value : null;

        try {
            if (monitorGain && ctx) {
                try {
                    monitorGain.gain.setValueAtTime(1.0, ctx.currentTime); // força 100% durante render
                } catch (err) {
                    // fallback
                    try { monitorGain.gain.value = 1.0; } catch (e) { /* noop */ }
                }
            }

            // Salva o estado dos painéis
            const savedState = savePanelVisibility();

            // Esconde os painéis
            hidePanels();

            // Declara o canvas aqui, fora do try
            const canvas = document.getElementById('stage-canvas');

            // 1. Inicia a gravação da tela
            const recorder = await startScreenRecording();

            // 2. Esconde o cursor apenas dentro do palco
            const stageEl = document.getElementById('stage');
            if (stageEl) stageEl.style.cursor = 'none';

            // 3. Inicia o áudio após o início da gravação
            if (!audioPlayer.isPlaying()) {
                audioPlayer.play();
            }

            // Atualiza o botão
            renderBtn.textContent = "🔴";
            renderBtn.disabled = true;

            // Calcula duração do áudio
            const duration = audioPlayer.getDuration();

            // Para a gravação após o fim do áudio
            setTimeout(() => {
                try {
                    if (recorder && recorder.state !== 'inactive') {
                        stopScreenRecording();
                    }
                } finally {
                    // restaura monitor volume se necessário
                    if (monitorGain && previousVolume !== null && ctx) {
                        try { monitorGain.gain.setValueAtTime(previousVolume, ctx.currentTime); }
                        catch (err) { try { monitorGain.gain.value = previousVolume; } catch (e) { /* noop */ } }
                    }

                    // Restaura os painéis, o canvas e o cursor
                    restorePanels(savedState);
                    if (canvas) canvas.style.display = 'block';
                    if (stageEl) stageEl.style.cursor = 'default';

                    renderBtn.textContent = '🎥';
                    renderBtn.disabled = false;
                }
            }, duration * 1000 + 1000); // +1s de margem

        } catch (err) {
            console.error('Erro na gravação:', err);

            // Em caso de erro, restaura volume e UI
            try {
                if (monitorGain && previousVolume !== null && ctx) {
                    monitorGain.gain.setValueAtTime(previousVolume, ctx.currentTime);
                }
            } catch (e) { /* noop */ }

            // Restaura UI
            restorePanels();
            const canvas = document.getElementById('stage-canvas');
            if (canvas) canvas.style.display = 'block';
            const stageEl = document.getElementById('stage');
            if (stageEl) stageEl.style.cursor = 'default';
            renderBtn.textContent = '🎥';
            renderBtn.disabled = false;
            alert('Erro ao iniciar gravação. Verifique as permissões do navegador.');
        }
    });

    // Adiciona o botão ao corpo
    document.body.appendChild(renderBtn);

    // Listener que conecta o player de áudio com a API do personagem
    document.addEventListener('timeupdate', (e) => {
        const { animationData } = e.detail || {};
        if (!animationData) return;

        if (animationData.eyes) {
            characterAPI.setExpression(animationData.eyes);
        }

        if (animationData.mouth) {
            characterAPI.setMouth(animationData.mouth);
        }

        if (animationData.gaze) {
            characterAPI.setGaze(animationData.gaze.x, animationData.gaze.y);
        }

        if (animationData.gender) {
            characterAPI.setGender(animationData.gender);
        }
    });

    console.log("Sistema com HUD pronto.");
}

// Inicia o sistema quando a página carregar
document.addEventListener('DOMContentLoaded', main);
