// JS/modules/export/screen-recorder.js

import audioPlayer from '../playback-panel/audio-player.js';

let mediaRecorder = null;
let recordedChunks = [];

// Elementos a esconder durante a gravação
const panelsToHide = [
    '#left-panel',
    '#right-panel',
    '#playback-panel',
    '#waveform-panel',
    '.panel-title',
    'button:not(#render-video-btn)',
    '#gaze-hud-container',
    '#audio-module',
    '#expression-markers-list'
];

/**
 * Salva o estado atual de visibilidade dos elementos
 * @returns {Object} - Estado de visibilidade
 */
export function savePanelVisibility() {
    const state = {};
    panelsToHide.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) state[selector] = el.style.display;
    });
    return state;
}

/**
 * Esconde todos os painéis
 */
export function hidePanels() {
    panelsToHide.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.display = 'none';
    });
}

/**
 * Restaura o estado original dos painéis
 * @param {Object} state - Estado salvo
 */
export function restorePanels(state) {
    Object.entries(state).forEach(([selector, display]) => {
        const el = document.querySelector(selector);
        if (el) el.style.display = display;
    });
}

/**
 * Inicia a gravação da tela
 */
export async function startScreenRecording() {
    try {
        // 1. Pede ao usuário para compartilhar a tela
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
            preferCurrentTab: true // ✅ Tenta gravar apenas a aba atual
        });

        // 2. Captura o áudio do projeto
        const audioStream = await getAudioStream();

        // 3. Combina os streams
        const combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        // 4. Configura o MediaRecorder
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm;codecs=vp9,opus'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `animacao-${new Date().toISOString().slice(0, 19)}.webm`;
            a.click();
            URL.revokeObjectURL(url);

            // Libera os streams
            combinedStream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        console.log("🎥 Gravação de tela iniciada.");

        return mediaRecorder;

    } catch (err) {
        console.error("Erro ao iniciar gravação de tela:", err);
        alert("Falha ao iniciar gravação. Permita o acesso à tela.");
        throw err;
    }
}

/**
 * Captura o áudio do projeto e o reproduz
 * @returns {Promise<MediaStream>}
 */
function getAudioStream() {
    return new Promise((resolve, reject) => {
        const audioCtx = audioPlayer.getAudioContext();
        const audioBuffer = audioPlayer.getAudioBuffer();

        if (!audioCtx || !audioBuffer) {
            reject(new Error("Áudio não carregado."));
            return;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;

        const destination = audioCtx.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioCtx.destination); // Toca o áudio

        // Inicia o áudio no tempo 0
        source.start(0);

        resolve(destination.stream);
    });
}

/**
 * Para a gravação
 */
export function stopScreenRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}