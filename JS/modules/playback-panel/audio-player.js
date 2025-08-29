/* JS/modules/playback-panel/audio-player.js */

import * as timelineController from '../timeline-controller.js'; // Importa o novo controlador

// Garante que só existe um AudioContext na aplicação
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let audioBuffer = null;
let sourceNode = null;
let isPlaying = false;
let startTime = 0;
let pauseTime = 0;
let animationFrameId = null;

/**
 * Formata segundos para o formato MM:SS.ms
 * @param {number} seconds - O tempo em segundos.
 * @returns {string} O tempo formatado.
 */
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00.00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

/**
 * Dispara um evento customizado no documento.
 * @param {string} name - O nome do evento.
 * @param {object} detail - Os dados para enviar com o evento.
 */
function dispatchEvent(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * Loop de animação que atualiza a UI enquanto o áudio está tocando.
 */
function updateLoop() {
    if (!isPlaying) {
        cancelAnimationFrame(animationFrameId);
        return;
    }
    const currentTime = audioContext.currentTime - startTime;

    // --- NOVA INTEGRAÇÃO COM A TIMELINE ---
    // Pega os valores da timeline para o tempo atual
    const expression = timelineController.getValueAtTime('expression', currentTime);
    // (No futuro, faremos o mesmo para olhar, posição, etc.)
    // const gaze = timelineController.getValueAtTime('gaze', currentTime);
    
    dispatchEvent('timeupdate', { 
        currentTime: currentTime, 
        formattedTime: formatTime(currentTime),
        progress: (currentTime / audioBuffer.duration) * 100,
        // Envia os dados da animação junto com a atualização de tempo
        animationData: {
            expression: expression
            // gaze: gaze, ...
        }
    });
    
    if (currentTime >= audioBuffer.duration) {
        api.pause();
        api.seek(audioBuffer.duration); // Garante que vá até o final
        dispatchEvent('ended');
    } else {
        animationFrameId = requestAnimationFrame(updateLoop);
    }
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
        sourceNode.connect(audioContext.destination);

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
        
        dispatchEvent('statechange', { isPlaying: false });
        cancelAnimationFrame(animationFrameId);
    },

    seek: (time) => {
        const wasPlaying = isPlaying;
        if (isPlaying) api.pause();
        
        pauseTime = Math.max(0, Math.min(time, audioBuffer.duration));
        
        dispatchEvent('timeupdate', { 
            currentTime: pauseTime, 
            formattedTime: formatTime(pauseTime),
            progress: (pauseTime / audioBuffer.duration) * 100,
            animationData: { // Também envia dados de animação ao buscar manualmente
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
        cancelAnimationFrame(animationFrameId);

        dispatchEvent('unloaded');
        console.log("Player de áudio resetado.");
    },

    getCurrentTime: () => isPlaying ? audioContext.currentTime - startTime : pauseTime,
    getDuration: () => audioBuffer ? audioBuffer.duration : 0,
    isPlaying: () => isPlaying
};

export default api;