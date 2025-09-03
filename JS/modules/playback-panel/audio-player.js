/* JS/modules/playback-panel/audio-player.js */

import * as timelineController from '../timeline-controller.js';
import { getState } from '../character/character-state.js';
import { expressionPresets } from '../character/expression-presets.js';

// --- Contexto de áudio e análise ---
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

let gainNode = null;

// --- Estado do player ---
let audioBuffer = null;
let sourceNode = null;
let isPlaying = false;
let startTime = 0;
let pauseTime = 0;
let animationFrameId = null;

// --- Lógica do lip sync automático ---
const mouthChangeInterval = 0.15;
let lastMouthChangeTime = 0;
let currentRandomMouth = null;
const randomMouthList = ['a', 'o', 'e', 'u', 'i', 'm', 'ch', 'l', 'r'];

/**
 * Cria e retorna o nó de ganho para monitor de volume
 */
function createGainNode() {
    if (!gainNode) {
        gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0;
    }
    return gainNode;
}

/**
 * Formata segundos em MM:SS.mm
 */
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00.00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

/**
 * Dispara eventos customizados
 */
function fireEvent(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * Loop de atualização: lip-sync + animação
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
        const average = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;

        if (average > characterState.sensitivity) {
            if (currentTime - lastMouthChangeTime > mouthChangeInterval) {
                currentRandomMouth = randomMouthList[Math.floor(Math.random() * randomMouthList.length)];
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

    fireEvent('timeupdate', {
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
        fireEvent('ended');
    } else {
        animationFrameId = requestAnimationFrame(updateLoop);
    }
}

/**
 * Reseta variáveis do lip sync automático
 */
function resetLipSync() {
    lastMouthChangeTime = 0;
    currentRandomMouth = null;
}

/**
 * API principal do player
 */
const api = {
    /**
     * Carrega um arquivo de áudio
     */
    load: (file) => new Promise((resolve, reject) => {
        api.reset();
        const reader = new FileReader();
        reader.onload = (e) => {
            audioContext.decodeAudioData(e.target.result).then((buffer) => {
                audioBuffer = buffer;
                fireEvent('loaded', {
                    duration: buffer.duration,
                    formattedDuration: formatTime(buffer.duration)
                });
                resolve(buffer.duration);
            }).catch(reject);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    }),

    /**
     * Inicia a reprodução
     */
    play: () => {
        if (isPlaying || !audioBuffer) return;

        createGainNode();

        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;

        // cadeia correta: source -> analyser -> gain -> destination
        sourceNode.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);

        startTime = audioContext.currentTime - pauseTime;
        sourceNode.start(0, pauseTime);
        isPlaying = true;

        fireEvent('statechange', { isPlaying: true });
        updateLoop();
    },

    /**
     * Pausa a reprodução
     */
    pause: () => {
        if (!isPlaying || !sourceNode) return;
        pauseTime = audioContext.currentTime - startTime;
        try { sourceNode.stop(); } catch (e) { /* noop */ }
        isPlaying = false;

        resetLipSync();
        fireEvent('statechange', { isPlaying: false });
        cancelAnimationFrame(animationFrameId);
    },

    /**
     * Avança ou retrocede o tempo
     */
    seek: (time) => {
        const wasPlaying = isPlaying;
        if (isPlaying) api.pause();

        pauseTime = Math.max(0, Math.min(time, audioBuffer.duration));
        resetLipSync();

        const key = timelineController.getValueAtTime('faceExpression', pauseTime);
        const preset = expressionPresets[key] || expressionPresets['feliz_feliz'];
        const gaze = timelineController.getValueAtTime('gaze', pauseTime);
        const gender = timelineController.getValueAtTime('gender', pauseTime);

        fireEvent('timeupdate', {
            currentTime: pauseTime,
            formattedTime: formatTime(pauseTime),
            progress: (pauseTime / audioBuffer.duration) * 100,
            animationData: {
                eyes: preset.eyes,
                mouth: preset.mouth,
                gaze,
                gender
            }
        });

        if (wasPlaying) api.play();
    },

    /**
     * Reseta o player
     */
    reset: () => {
        if (isPlaying) api.pause();
        if (sourceNode) {
            try { sourceNode.disconnect(); } catch (e) { /* noop */ }
            sourceNode = null;
        }
        audioBuffer = null;
        pauseTime = 0;
        startTime = 0;
        resetLipSync();
        cancelAnimationFrame(animationFrameId);
        fireEvent('unloaded');
    },

    // Getters
    formatTime,
    getCurrentTime: () => (isPlaying ? audioContext.currentTime - startTime : pauseTime),
    getDuration: () => (audioBuffer ? audioBuffer.duration : 0),
    isPlaying: () => isPlaying,
    getAudioBuffer: () => audioBuffer,
    getAudioContext: () => audioContext,
    getGainNode: () => gainNode || createGainNode()
};

export default api;
