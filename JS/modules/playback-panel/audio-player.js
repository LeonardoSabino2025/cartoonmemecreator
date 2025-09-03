/* JS/modules/playback-panel/audio-player.js */

import * as timelineController from '../timeline-controller.js';
import { getState } from '../character/character-state.js';
import { expressionPresets } from '../character/expression-presets.js';

// Cria o contexto de áudio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

// --- Variáveis de estado do player ---
let audioBuffer = null;
let sourceNode = null;
let isPlaying = false;
let startTime = 0;
let pauseTime = 0;
let animationFrameId = null;
let gainNode = null;

// --- Variáveis para a lógica de Lip Sync Automático ---
const mouthChangeInterval = 0.15;
let lastMouthChangeTime = 0;
let currentRandomMouth = null;
const randomMouthList = ['a', 'o', 'e', 'u', 'i', 'm', 'ch', 'l', 'r'];

/**
 * Formata segundos em MM:SS.mm
 * @param {number} seconds - Tempo em segundos
 * @returns {string} - Tempo formatado
 */
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00.00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

/**
 * Dispara um evento personalizado
 * @param {string} name - Nome do evento
 * @param {Object} detail - Dados do evento
 */
function dispatchEvent(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * Loop principal de atualização do player
 */
function updateLoop() {
    if (!isPlaying) {
        cancelAnimationFrame(animationFrameId);
        return;
    }

    const currentTime = audioContext.currentTime - startTime;
    const characterState = getState();

    const currentExpressionKey = timelineController.getValueAtTime('faceExpression', currentTime);
    const currentPreset = expressionPresets[currentExpressionKey] || expressionPresets['feliz_feliz'];
    const currentGaze = timelineController.getValueAtTime('gaze', currentTime);
    const currentGender = timelineController.getValueAtTime('gender', currentTime);

    let mouthToRender = null;
    if (characterState.animationMode === 'auto') {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        if (average > characterState.sensitivity) {
            if (currentTime - lastMouthChangeTime > mouthChangeInterval) {
                const randomIndex = Math.floor(Math.random() * randomMouthList.length);
                currentRandomMouth = randomMouthList[randomIndex];
                lastMouthChangeTime = currentTime;
            }
            mouthToRender = currentRandomMouth;
        } else {
            currentRandomMouth = null;
            mouthToRender = currentPreset.mouth;
        }
    } else {
        mouthToRender = timelineController.getValueAtTime('phoneme', currentTime);
    }

    dispatchEvent('timeupdate', {
        currentTime,
        formattedTime: formatTime(currentTime),
        progress: (currentTime / audioBuffer.duration) * 100,
        animationData: {
            eyes: currentPreset.eyes,
            mouth: mouthToRender,
            gaze: currentGaze,
            gender: currentGender
        }
    });

    if (currentTime >= audioBuffer.duration) {
        api.pause();
        api.seek(audioBuffer.duration);
        dispatchEvent('ended');
    } else {
        animationFrameId = requestAnimationFrame(updateLoop);
    }
}

/**
 * Reseta o estado do lip sync automático
 */
function resetAutoLipSyncState() {
    lastMouthChangeTime = 0;
    currentRandomMouth = null;
}

/**
 * API principal do player de áudio
 */
const api = {
    /**
     * Carrega um arquivo de áudio
     * @param {File} file - Arquivo de áudio
     * @returns {Promise<number>} - Duração do áudio
     */
    load: (file) => {
        return new Promise((resolve, reject) => {
            api.reset();
            const reader = new FileReader();
            reader.onload = (e) => {
                audioContext.decodeAudioData(e.target.result, (buffer) => {
                    audioBuffer = buffer;
                    dispatchEvent('loaded', {
                        duration: audioBuffer.duration,
                        formattedDuration: formatTime(audioBuffer.duration)
                    });
                    resolve(audioBuffer.duration);
                }, (error) => reject(error));
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Inicia a reprodução do áudio
     */
    play: () => {
        if (isPlaying || !audioBuffer) return;

        // Reinicia o sourceNode
        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;

        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);

        startTime = audioContext.currentTime - pauseTime;
        sourceNode.start(0, pauseTime);
        isPlaying = true;

        dispatchEvent('statechange', { isPlaying: true });
        updateLoop();
    },

    /**
     * Pausa a reprodução do áudio
     */
    pause: () => {
        if (!isPlaying || !sourceNode) return;
        pauseTime = audioContext.currentTime - startTime;
        sourceNode.stop();
        isPlaying = false;

        resetAutoLipSyncState();
        dispatchEvent('statechange', { isPlaying: false });
        cancelAnimationFrame(animationFrameId);
    },

    /**
     * Posiciona o tempo de reprodução
     * @param {number} time - Tempo em segundos
     */
    seek: (time) => {
        const wasPlaying = isPlaying;
        if (isPlaying) api.pause();

        pauseTime = Math.max(0, Math.min(time, audioBuffer.duration));

        resetAutoLipSyncState();

        const currentExpressionKey = timelineController.getValueAtTime('faceExpression', pauseTime);
        const currentPreset = expressionPresets[currentExpressionKey] || expressionPresets['feliz_feliz'];
        const currentGaze = timelineController.getValueAtTime('gaze', pauseTime);
        const currentGender = timelineController.getValueAtTime('gender', pauseTime);

        dispatchEvent('timeupdate', {
            currentTime: pauseTime,
            formattedTime: formatTime(pauseTime),
            progress: (pauseTime / audioBuffer.duration) * 100,
            animationData: {
                eyes: currentPreset.eyes,
                mouth: currentPreset.mouth,
                gaze: currentGaze,
                gender: currentGender
            }
        });

        if (wasPlaying) api.play();
    },

    /**
     * Reseta o player para o estado inicial
     */
    reset: () => {
        if (isPlaying) api.pause();

        audioBuffer = null;
        sourceNode = null;
        pauseTime = 0;
        startTime = 0;

        resetAutoLipSyncState();
        cancelAnimationFrame(animationFrameId);
        dispatchEvent('unloaded');
    },

    // --- Funções de consulta ---
    formatTime: formatTime,
    getCurrentTime: () => isPlaying ? audioContext.currentTime - startTime : pauseTime,
    getDuration: () => audioBuffer ? audioBuffer.duration : 0,
    isPlaying: () => isPlaying,
    getAudioBuffer: () => audioBuffer,
    getAudioContext: () => audioContext
};

// Exporta a API principal
export default api;

// Exporta funções úteis
export { formatTime, gainNode }; // ✅ Exporte o gainNode