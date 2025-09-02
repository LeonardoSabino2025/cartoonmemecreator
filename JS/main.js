/* JS/main.js */

import {
    startScreenRecording,
    stopScreenRecording,
    savePanelVisibility,
    hidePanels,
    restorePanels
} from './modules/export/screen-recorder.js';
import { initialize as initializeCharacterAPI } from './modules/character/character-api.js';
import * as audioHandler from './modules/left-panel/audio-handler.js';
import * as genderHandler from './modules/left-panel/gender-handler.js';
import * as slidersHandler from './modules/left-panel/sliders-handler.js';
import { initialize as initializePlaybackHandler } from './modules/playback-panel/playback-handler.js';
import { initialize as initializeWaveformHandler } from './modules/playback-panel/waveform-handler.js';
import * as timelineController from './modules/timeline-controller.js';
import { initialize as initializeRightPanel } from './modules/right-panel/right-panel-handler.js';
import { initialize as initializeGazeHud } from './modules/stage/gaze-hud-handler.js';

// Referência para o player de áudio
import audioPlayer from './modules/playback-panel/audio-player.js';

// Variável para controle de atualização do canvas
let renderLoopId = null;

function main() {
    const characterAPI = initializeCharacterAPI();

    initializePlaybackHandler(characterAPI);
    initializeWaveformHandler();
    initializeRightPanel(characterAPI, timelineController);
    audioHandler.initialize();
    genderHandler.initialize(characterAPI);
    slidersHandler.initialize(characterAPI);
    initializeGazeHud(characterAPI, timelineController);

    // === CRIAÇÃO DO INDICADOR DE GRAVAÇÃO ===
    const recordingIndicator = document.createElement('div');
    recordingIndicator.id = 'recording-indicator';
    document.body.appendChild(recordingIndicator);

    function showRecordingIndicator(show) {
        recordingIndicator.style.display = show ? 'block' : 'none';
    }

    // === ATUALIZAÇÃO DO CANVAS EM TEMPO REAL (com espera) ===
    async function updateCanvas() {
        const canvas = document.getElementById('stage-canvas');
        const characterContainer = document.getElementById('character-container');

        if (!canvas || !characterContainer) {
            console.warn("Canvas ou container não encontrado.");
            return;
        }

        // Configura o contexto com willReadFrequently
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.imageSmoothingEnabled = false;

        // Preenche com fundo verde (não transparente)
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        try {
            const rendered = await html2canvas(characterContainer, {
                backgroundColor: null,
                scale: 1,
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: characterContainer.offsetWidth,
                height: characterContainer.offsetHeight
            });

            ctx.drawImage(rendered, 0, 0);

            // ✅ Depuração: desenha texto para confirmar que o canvas tem conteúdo
            ctx.fillStyle = 'red';
            ctx.font = '20px Arial';
            ctx.fillText('GRAVANDO', 50, 50);

        } catch (err) {
            console.error("Erro ao renderizar com html2canvas:", err);
        }
    }

    // === LOOP DE RENDERIZAÇÃO USANDO requestAnimationFrame ===
    function startRenderLoop() {
        updateCanvas();
        renderLoopId = requestAnimationFrame(startRenderLoop);
    }

    function stopRenderLoop() {
        if (renderLoopId) {
            cancelAnimationFrame(renderLoopId);
            renderLoopId = null;
        }
    }

    // Controla o loop com base no estado do áudio
    document.addEventListener('statechange', (e) => {
        if (e.detail.isPlaying) {
            if (!renderLoopId) startRenderLoop();
        } else {
            stopRenderLoop();
        }
    });

    document.addEventListener('ended', stopRenderLoop);

    // === BOTÃO "RENDERIZAR VÍDEO" (Gravação de Tela) ===
    const renderBtn = document.getElementById('render-video-btn');

    if (renderBtn) {
        renderBtn.addEventListener('click', async () => {
            if (!audioPlayer.getAudioBuffer()) {
                alert("⚠️ Carregue um áudio antes de renderizar.");
                return;
            }

            // Salva o estado dos painéis
            const savedState = savePanelVisibility();

            // Esconde os painéis
            hidePanels();

            const canvas = document.getElementById('stage-canvas');
            if (canvas) canvas.style.display = 'none';

            // Mostra uma mensagem no topo da tela
            const message = document.createElement('div');
            message.id = 'recording-message';
            message.style.position = 'fixed';
            message.style.top = '50px';
            message.style.left = '50%';
            message.style.transform = 'translateX(-50%)';
            message.style.backgroundColor = '#ff0000';
            message.style.color = 'white';
            message.style.padding = '10px 20px';
            message.style.borderRadius = '8px';
            message.style.zIndex = '9999';
            message.style.fontSize = '1rem';
            message.textContent = '⚠️ Clique em "Compartilhar" na aba do seu navegador para gravar a tela.';
            document.body.appendChild(message);

            // Remove a mensagem após 3 segundos
            setTimeout(() => {
                if (message && message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 3000);

            try {
                // Inicia a gravação da tela (isso pausa o script até o usuário escolher a aba)
                const recorder = await startScreenRecording();

                // Após a gravação começar, inicia o áudio
                if (!audioPlayer.isPlaying()) {
                    audioPlayer.play();
                }

                showRecordingIndicator(true);
                renderBtn.textContent = "🔴 Gravando...";
                renderBtn.disabled = true;

                // Calcula duração do áudio
                const duration = audioPlayer.getDuration();

                // Para a gravação após o fim do áudio
                setTimeout(() => {
                    if (recorder && recorder.state !== 'inactive') {
                        stopScreenRecording();
                    }
                    // Restaura os painéis
                    restorePanels(savedState);
                    if (canvas) canvas.style.display = 'block';
                    renderBtn.textContent = "Renderizar Vídeo";
                    renderBtn.disabled = false;
                    showRecordingIndicator(false);
                }, duration * 1000 + 1000); // +1s de margem

            } catch (err) {
                // Em caso de erro, restaura os painéis
                restorePanels(savedState);
                if (canvas) canvas.style.display = 'block';
                renderBtn.textContent = "Renderizar Vídeo";
                renderBtn.disabled = false;
                showRecordingIndicator(false);
            }
        });
    }

    // Listener que conecta o player de áudio com a API do personagem
    document.addEventListener('timeupdate', (e) => {
        const { animationData } = e.detail;
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