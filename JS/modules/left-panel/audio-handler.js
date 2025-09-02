/* JS/modules/left-panel/audio-handler.js */

import audioPlayer from '../playback-panel/audio-player.js';

/**
 * Cria e injeta o HTML inicial para o módulo de áudio.
 * @param {HTMLElement} container - O elemento pai onde o HTML será inserido.
 */
function render(container) {
container.innerHTML = `
  <h3>Áudio</h3>
  <div id="audio-controls">
    <input type="file" id="audio-file-input" accept="audio/*" style="display:none">
    <label id="upload-audio-label" for="audio-file-input" class="btn">Carregar Áudio</label>
    <button id="cancel-audio-btn" style="display:none;">Cancelar</button>    
    <button id="render-video-btn" class="btn" style="background-color: var(--cor-realce); color: white; margin-top: 10px;">
      Renderizar Vídeo
    </button>
  </div>
  <div id="audio-info"></div>
  <div id="audio-status"></div>
`;
}

/**
 * Lida com o processo de seleção e carregamento de um arquivo de áudio.
 * @param {Event} event - O evento do input de arquivo.
 * @param {object} domElements - Referências para os elementos da UI.
 */
async function handleFileSelect(event, domElements) {
    const file = event.target.files[0];
    if (!file) return;

    domElements.uploadLabel.style.display = 'none';
    domElements.audioInfo.style.display = 'flex';
    domElements.statusText.textContent = 'Carregando...';

    try {
        await audioPlayer.load(file);
        domElements.statusText.textContent = file.name;
        domElements.statusText.title = file.name;
    } catch (error) {
        console.error("Erro ao carregar o áudio:", error);
        domElements.statusText.textContent = 'Erro no arquivo!';
        // Desabilita o botão de cancelar se deu erro
        domElements.cancelBtn.disabled = true;
    }
}

/**
 * Reseta a UI de áudio e o player para o estado inicial.
 * @param {object} domElements - Referências para os elementos da UI.
 */
function resetAudio(domElements) {
    audioPlayer.reset(); // Chama a função de reset do motor de áudio
    
    domElements.fileInput.value = ''; // Limpa a seleção do input
    domElements.uploadLabel.style.display = 'block';
    domElements.audioInfo.style.display = 'none';
    domElements.statusText.textContent = 'Aguardando áudio...';
    domElements.cancelBtn.disabled = false; // Reabilita o botão para o próximo uso
}

export function initialize() {
    const container = document.getElementById('audio-module');
    if (!container) {
        console.error('Módulo de Áudio não encontrado no HTML.');
        return;
    }

    render(container);

    const domElements = {
        fileInput: container.querySelector('#audio-file-input'),
        uploadLabel: container.querySelector('#upload-audio-label'),
        audioInfo: container.querySelector('#audio-info'),
        statusText: container.querySelector('#audio-status'),
        cancelBtn: container.querySelector('#cancel-audio-btn'),
    };

    domElements.fileInput.addEventListener('change', (event) => handleFileSelect(event, domElements));
    domElements.cancelBtn.addEventListener('click', () => resetAudio(domElements));
}