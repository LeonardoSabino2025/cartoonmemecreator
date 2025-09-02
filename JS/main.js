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

function main() {
    const characterAPI = initializeCharacterAPI();

    initializePlaybackHandler(characterAPI);
    initializeWaveformHandler();
    initializeRightPanel(characterAPI, timelineController);
    audioHandler.initialize();
    genderHandler.initialize(characterAPI);
    slidersHandler.initialize(characterAPI);
    initializeGazeHud(characterAPI, timelineController);

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

            // Oculta temporariamente o canvas para evitar clones
            const canvas = document.getElementById('stage-canvas');
            if (canvas) canvas.style.display = 'none';

            // Mostra uma mensagem clara para o usuário
            const message = document.createElement('div');
            message.id = 'recording-message';
            message.style.position = 'fixed';
            message.style.top = '50px';
            message.style.left = '50%';
            message.style.transform = 'translateX(-50%)';
            message.style.backgroundColor = '#ff0000';
            message.style.color = 'white';
            message.style.padding = '12px 20px';
            message.style.borderRadius = '8px';
            message.style.zIndex = '9999';
            message.style.fontSize = '2rem';
            message.style.textAlign = 'center';
            message.style.maxWidth = '80%';
            message.innerHTML = `
                ⚠️ Clique em "Compartilhar" na aba do seu navegador.<br>
                <small>Deixe o cursor do mouse longe do rosto do personagem.</small>
            `;
            document.body.appendChild(message);

            // Remove a mensagem após 4 segundos (ou quando a gravação começar)
            const hideMessage = () => {
                if (message && message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            };
            setTimeout(hideMessage, 4000);

            try {
                // 1. Inicia a gravação da tela (espera o usuário escolher a aba)
                const recorder = await startScreenRecording();

                // Mensagem removida assim que a gravação começa
                hideMessage();

                // 2. Inicia o áudio somente após a gravação estar ativa
                if (!audioPlayer.isPlaying()) {
                    audioPlayer.play();
                }

                // Atualiza o botão
                renderBtn.textContent = "🔴 Gravando...";
                renderBtn.disabled = true;

                // Calcula duração do áudio
                const duration = audioPlayer.getDuration();

                // Para a gravação após o fim do áudio
                setTimeout(() => {
                    if (recorder && recorder.state !== 'inactive') {
                        stopScreenRecording();
                    }

                    // Restaura os painéis e o canvas
                    restorePanels(savedState);
                    if (canvas) canvas.style.display = 'block';
                    renderBtn.textContent = "Renderizar Vídeo";
                    renderBtn.disabled = false;
                }, duration * 1000 + 1000); // +1s de margem

            } catch (err) {
                // Em caso de erro, restaura os painéis
                hideMessage();
                restorePanels(savedState);
                if (canvas) canvas.style.display = 'block';
                renderBtn.textContent = "Renderizar Vídeo";
                renderBtn.disabled = false;
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