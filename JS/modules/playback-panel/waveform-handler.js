/* JS/modules/playback-panel/waveform-handler.js */

import audioPlayer from './audio-player.js';

// Define quantas barras visuais serão desenhadas para representar o áudio
const NUMBER_OF_BARS = 250;
let needleElement = null; // Referência para o elemento da agulha

/**
 * Analisa o buffer de áudio e desenha as barras do espectro na tela.
 */
function renderWaveform() {
    const audioBuffer = audioPlayer.getAudioBuffer();
    if (!audioBuffer) return;

    const panel = document.getElementById('waveform-panel');
    const container = document.getElementById('waveform-container');
    if (!panel || !container) return;
    
    // Pega os dados de um canal do áudio (ex: canal esquerdo)
    const data = audioBuffer.getChannelData(0);
    // Calcula quantos "samples" do áudio original cabem em uma única barra visual
    const samplesPerBar = Math.floor(data.length / NUMBER_OF_BARS);
    
    container.innerHTML = ''; // Limpa o container antes de desenhar
    
    // Para normalizar a altura das barras, primeiro encontramos o pico máximo no áudio todo
    let overallPeak = 0;
    for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i]) > overallPeak) {
            overallPeak = Math.abs(data[i]);
        }
    }
    if (overallPeak === 0) overallPeak = 1; // Evita divisão por zero em arquivos de silêncio

    // Cria as barras
    for (let i = 0; i < NUMBER_OF_BARS; i++) {
        const start = i * samplesPerBar;
        const end = start + samplesPerBar;
        let maxPeakInChunk = 0;

        // Para cada barra, encontra o pico máximo no seu respectivo trecho do áudio
        for (let j = start; j < end; j++) {
            const value = Math.abs(data[j]);
            if (value > maxPeakInChunk) {
                maxPeakInChunk = value;
            }
        }

        // Normaliza a altura da barra (0 a 100%) com base no pico geral
        const height = (maxPeakInChunk / overallPeak) * 100;
        
        const bar = document.createElement('div');
        bar.className = 'waveform-bar';
        bar.style.height = `${height}%`;
        
        container.appendChild(bar);
    }
    
    panel.style.display = 'flex'; // Mostra o painel
    if (needleElement) needleElement.style.display = 'block'; // Mostra a agulha
}

/**
 * Limpa o visualizador de espectro e a agulha.
 */
function clearWaveform() {
    const panel = document.getElementById('waveform-panel');
    const container = document.getElementById('waveform-container');
    if (container) container.innerHTML = '';
    if (panel) panel.style.display = 'none'; // Esconde o painel
    if (needleElement) {
        needleElement.style.display = 'none'; // Esconde a agulha
        needleElement.style.left = '0%'; // Reseta a posição
    }
}

/**
 * Atualiza a posição da agulha com base no progresso do áudio.
 * @param {number} progress - O progresso do áudio (0 a 100).
 */
function updateNeedlePosition(progress) {
    if (!needleElement) return;
    // Multiplica por 10 porque o slider vai de 0-1000, mas o progresso vem como 0-100
    // A propriedade `left` em % já espera um valor de 0 a 100.
    needleElement.style.left = `${progress}%`;
}


export function initialize() {
    const panel = document.getElementById('waveform-panel');
    if (!panel) return;

    // Cria o container interno e a agulha, e esconde o painel por padrão
    panel.innerHTML = `
        <div id="waveform-container"></div>
        <div id="waveform-progress-needle"></div>
    `;
    needleElement = panel.querySelector('#waveform-progress-needle');
    panel.style.display = 'none';

    // Escuta os eventos para controlar a UI
    document.addEventListener('loaded', renderWaveform);
    document.addEventListener('unloaded', clearWaveform);
    
    // Escuta o evento de tempo para mover a agulha
    document.addEventListener('timeupdate', (e) => {
        // O valor `e.detail.progress` já vem como uma porcentagem (0-100)
        updateNeedlePosition(e.detail.progress);
    });
}