// JS/modules/export/video-renderer.js

import audioPlayer from '../playback-panel/audio-player.js';

let mediaRecorder = null;
let recordedChunks = [];
let videoStream = null;
let audioStream = null;
let combinedStream = null;

// Referência ao sourceNode e ao destination para controle de timing
let sourceNode = null;
let destination = null;

/**
 * Inicializa o sistema de renderização de vídeo.
 * Deve ser chamado quando o palco estiver pronto.
 */
export function setupVideoRenderer(stageElement, fps = 30) {
  // Verifica suporte
  if (!stageElement.captureStream) {
    console.error("Seu navegador não suporta captureStream().");
    return false;
  }

  // Captura o stream de vídeo do palco
  videoStream = stageElement.captureStream(fps);

  return true;
}

/**
 * Inicia a gravação de vídeo + áudio.
 */
export async function startRecording() {
  recordedChunks = [];

  // 1. Prepara o stream de áudio (sem tocar ainda)
  try {
    audioStream = await setupAudioStream();
  } catch (err) {
    console.error("Falha ao preparar áudio:", err);
    return;
  }

  // 2. Combina vídeo e áudio em um único stream
  combinedStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...audioStream.getAudioTracks()
  ]);

  // 3. Configura o MediaRecorder
  try {
    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Gera o blob e dispara o download
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `animacao-${new Date().toISOString().slice(0, 19)}.webm`;
      a.click();
      URL.revokeObjectURL(url);

      // Limpa recursos
      cleanup();
    };

    // 🎯 INICIA A GRAVAÇÃO
    mediaRecorder.start();
    console.log("Gravação iniciada.");

    // 🎵 INICIA O ÁUDIO EXATAMENTE COM A GRAVAÇÃO
if (sourceNode) {
setTimeout(() => {
    if (sourceNode) sourceNode.start(0);
}, 100); // Pequeno delay para garantir que o canvas esteja pronto
}

  } catch (err) {
    console.error("Erro ao iniciar MediaRecorder:", err);
    cleanup();
  }
}

/**
 * Para a gravação.
 */
export function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop(); // Isso aciona onstop
  } else {
    console.warn("Tentativa de parar gravação inexistente.");
  }
}

/**
 * Prepara o stream de áudio sem tocar.
 * @returns {Promise<MediaStream>}
 */
function setupAudioStream() {
  return new Promise((resolve, reject) => {
    const audioCtx = audioPlayer.getAudioContext();
    const audioBuffer = audioPlayer.getAudioBuffer();

    if (!audioCtx || !audioBuffer) {
      reject(new Error("Áudio não carregado."));
      return;
    }

    // Cria o source
    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;

    // Cria o destino de stream
    destination = audioCtx.createMediaStreamDestination();

    // Conecta: source → destination (para gravação) e → speakers (para audição)
    sourceNode.connect(destination);
    sourceNode.connect(audioCtx.destination);

    // Não inicia ainda! Isso será feito em startRecording()
    resolve(destination.stream);
  });
}

/**
 * Limpa os recursos após a gravação.
 */
function cleanup() {
  if (sourceNode) {
    sourceNode = null;
  }
  if (destination) {
    destination = null;
  }
  if (combinedStream) {
    combinedStream.getTracks().forEach(track => track.stop());
    combinedStream = null;
  }
  mediaRecorder = null;
}