/* JS/modules/playback-panel/audio-player.js */

import * as timelineController from '../timeline-controller.js';
import { getState } from '../character/character-state.js';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

let audioBuffer = null;
let sourceNode = null;
let isPlaying = false;
let startTime = 0;
let pauseTime = 0;
let animationFrameId = null;

const mouthChangeInterval = 0.15;
let lastMouthChangeTime = 0;
let currentRandomMouth = null;
const randomMouthList = ['a', 'o', 'e', 'u', 'i', 'm', 'ch', 'l', 'r'];

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00.00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

function dispatchEvent(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * Lógica que decide qual boca mostrar no modo automático.
 * @param {object} characterState - O objeto de estado atual contendo humor e sensibilidade.
 * @param {number} currentTime - O tempo atual do áudio.
 * @returns {string} O nome do SVG da boca a ser exibida.
 */
function getAutoLipSyncMouth(characterState, currentTime) {
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

    // ATUALIZAÇÃO: Lê a sensibilidade do estado central em vez de usar um valor fixo.
    if (average > characterState.sensitivity) {
        if (currentTime - lastMouthChangeTime > mouthChangeInterval) {
            const randomIndex = Math.floor(Math.random() * randomMouthList.length);
            currentRandomMouth = randomMouthList[randomIndex];
            lastMouthChangeTime = currentTime;
        }
        return currentRandomMouth;
    } else {
        currentRandomMouth = null;
        return characterState.mood; // Usa o humor do estado para o silêncio
    }
}

function updateLoop() {
    if (!isPlaying) {
        cancelAnimationFrame(animationFrameId);
        return;
    }
    const currentTime = audioContext.currentTime - startTime;
    const characterState = getState();
    
    let mouthToRender = null;
    if (characterState.animationMode === 'auto') {
        mouthToRender = getAutoLipSyncMouth(characterState, currentTime);
    } else {
        mouthToRender = timelineController.getValueAtTime('phoneme', currentTime);
    }

    dispatchEvent('timeupdate', { 
        currentTime, 
        formattedTime: formatTime(currentTime),
        progress: (currentTime / audioBuffer.duration) * 100,
        animationData: {
            expression: timelineController.getValueAtTime('expression', currentTime),
            mouth: mouthToRender
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

function resetAutoLipSyncState() {
    lastMouthChangeTime = 0;
    currentRandomMouth = null;
}

const api = {
    load: (file) => {
        return new Promise((resolve, reject) => {
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

    play: () => {
        if (isPlaying || !audioBuffer) return;
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

    pause: () => {
        if (!isPlaying || !sourceNode) return;
        pauseTime = audioContext.currentTime - startTime;
        sourceNode.stop();
        isPlaying = false;
        
        resetAutoLipSyncState();
        dispatchEvent('statechange', { isPlaying: false });
        cancelAnimationFrame(animationFrameId);
    },

    seek: (time) => {
        const wasPlaying = isPlaying;
        if (isPlaying) api.pause();
        
        pauseTime = Math.max(0, Math.min(time, audioBuffer.duration));
        
        resetAutoLipSyncState();

        dispatchEvent('timeupdate', { 
            currentTime: pauseTime, 
            formattedTime: formatTime(pauseTime),
            progress: (pauseTime / audioBuffer.duration) * 100,
            animationData: {
                expression: timelineController.getValueAtTime('expression', pauseTime)
            }
        });

        if (wasPlaying) api.play();
    },
    
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

    formatTime: formatTime,
    getCurrentTime: () => isPlaying ? audioContext.currentTime - startTime : pauseTime,
    getDuration: () => audioBuffer ? audioBuffer.duration : 0,
    isPlaying: () => isPlaying
};

export default api;