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

    // Cria o painel de volume flutuante
    const volumePanel = document.createElement('div');
    volumePanel.id = 'volume-panel';
    volumePanel.style.cssText = `
        position: absolute;
        top: -220px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 200px;
        background-color: rgba(255, 255, 255, 0.95);
        border: 1px solid #ccc;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        display: none;
        padding: 10px;
        text-align: center;
    `;

    // Cria o slider vertical
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.01';
    volumeSlider.value = '1';
    volumeSlider.style.cssText = `
        width: 100%;
        height: 160px;
        -webkit-appearance: none;
        background: #e0e0e0;
        border-radius: 10px;
        outline: none;
        margin: 10px 0;
    `;

    // Estilo do thumb
    volumeSlider.style.setProperty('background', 'linear-gradient(to top, #007bff 0%, #007bff ' + (volumeSlider.value * 100) + '%, #e0e0e0 ' + (volumeSlider.value * 100) + '%, #e0e0e0 100%)');
    volumeSlider.addEventListener('input', function() {
        this.style.setProperty('background', 'linear-gradient(to top, #007bff 0%, #007bff ' + (this.value * 100) + '%, #e0e0e0 ' + (this.value * 100) + '%, #e0e0e0 100%)');
    });

    volumePanel.appendChild(volumeSlider);
    panel.appendChild(volumePanel);

    // --- Listener para atualizar o volume ---
    volumeSlider.addEventListener('input', () => {
        const volume = parseFloat(volumeSlider.value);
        if (!audioPlayer.gainNode) {
            audioPlayer.gainNode = audioPlayer.getAudioContext().createGain();
            audioPlayer.gainNode.connect(audioPlayer.getAudioContext().destination);
        }
        audioPlayer.gainNode.gain.setValueAtTime(volume, audioPlayer.getAudioContext().currentTime);
    });

    // --- Atualiza o valor do slider quando o áudio é carregado ---
    document.addEventListener('loaded', () => {
        volumeSlider.value = '1';
        audioPlayer.gainNode?.gain.setValueAtTime(1, audioPlayer.getAudioContext().currentTime);
    });

    // Escuta os eventos para controlar a UI
    document.addEventListener('loaded', renderWaveform);
    document.addEventListener('unloaded', clearWaveform);
    
    // Escuta o evento de tempo para mover a agulha
    document.addEventListener('timeupdate', (e) => {
        updateNeedlePosition(e.detail.progress);
    });

    // Escuta o evento de arrasto da timeline
    document.addEventListener('timelineScrub', (e) => {
        updateNeedlePosition(e.detail.progress);
    });
}