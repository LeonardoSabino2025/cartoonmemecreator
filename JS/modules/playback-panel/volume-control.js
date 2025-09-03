/* JS/modules/playback-panel/volume-control.js */

import audioPlayer from './audio-player.js';

let volumePanel = null;
let volumeSlider = null;
let volumeButton = null;
let isVolumeOpen = false;

/**
 * Posiciona o painel próximo ao botão (tenta aparecer acima, caso não tenha espaço aparece abaixo).
 */
function positionPanel() {
    if (!volumePanel || !volumeButton) return;
    // torna visível para medir
    volumePanel.style.display = 'block';
    volumePanel.style.position = 'fixed';
    volumePanel.style.zIndex = '1001';

    const btnRect = volumeButton.getBoundingClientRect();
    const panelRect = volumePanel.getBoundingClientRect();
    const centerX = btnRect.left + (btnRect.width / 2) - (panelRect.width / 2);

    // tenta posicionar acima do botão, se couber; senão posiciona abaixo
    let top = btnRect.top - panelRect.height - 8;
    if (top < 8) top = btnRect.bottom + 8;

    // garante dentro da viewport
    const left = Math.min(Math.max(8, centerX), window.innerWidth - panelRect.width - 8);

    volumePanel.style.left = `${left}px`;
    volumePanel.style.top = `${top}px`;
}

/**
 * Mostra o painel de volume
 */
function showVolumePanel() {
    if (!volumePanel || !volumeButton) return;
    isVolumeOpen = true;
    positionPanel();
    volumePanel.style.display = 'block';
}

/**
 * Esconde o painel de volume
 */
function hideVolumePanel() {
    if (!volumePanel) return;
    isVolumeOpen = false;
    volumePanel.style.display = 'none';
}

/**
 * Alterna a visibilidade do painel de volume
 */
function toggleVolumePanel() {
    if (isVolumeOpen) hideVolumePanel(); else showVolumePanel();
}

/**
 * Atualiza o volume do áudio (usa o gainNode provido pelo audioPlayer)
 * @param {number} volume - Valor entre 0 e 1
 */
function setVolume(volume) {
    const gainNode = (typeof audioPlayer.getGainNode === 'function') ? audioPlayer.getGainNode() : null;
    const ctx = (typeof audioPlayer.getAudioContext === 'function') ? audioPlayer.getAudioContext() : null;

    if (gainNode) {
        try {
            if (ctx && gainNode.gain.setValueAtTime) {
                gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            } else {
                gainNode.gain.value = volume;
            }
        } catch (err) {
            // fallback seguro
            try { gainNode.gain.value = volume; } catch (e) { /* noop */ }
        }
    }

    // Atualiza o ícone/título do botão
    if (volumeButton) {
        const volumeValue = Math.round((volume || 0) * 100);
        if (volumeValue === 0) {
            volumeButton.textContent = '🔇';
            volumeButton.title = 'Volume: 0%';
        } else if (volumeValue < 50) {
            volumeButton.textContent = '🔉';
            volumeButton.title = `Volume: ${volumeValue}%`;
        } else {
            volumeButton.textContent = '🔊';
            volumeButton.title = `Volume: ${volumeValue}%`;
        }
    }

    // Atualiza exibição do slider se existir
    if (volumeSlider) {
        volumeSlider.value = Math.round((volume || 0) * 100);
        const display = volumePanel ? volumePanel.querySelector('#volume-percentage') : null;
        if (display) display.textContent = `${Math.round((volume || 0) * 100)}%`;
    }
}

/**
 * Inicializa o controle de volume
 */
export function initialize() {
    const playbackPanel = document.getElementById('playback-panel');
    if (!playbackPanel) return;

    // Encontra ou cria o botão de volume
    volumeButton = playbackPanel.querySelector('#volume-btn');
    if (!volumeButton) {
        const playbackControls = playbackPanel.querySelector('.playback-controls');
        if (playbackControls) {
            volumeButton = document.createElement('button');
            volumeButton.id = 'volume-btn';
            volumeButton.textContent = '🔊';
            volumeButton.title = 'Volume: 100%';
            volumeButton.style.width = '40px';
            volumeButton.style.height = '40px';
            playbackControls.appendChild(volumeButton);
        }
    }

    // Cria o painel de volume (apenas 1 no body)
    volumePanel = document.getElementById('volume-panel');
    if (!volumePanel) {
        volumePanel = document.createElement('div');
        volumePanel.id = 'volume-panel';
        volumePanel.style.display = 'none';
        volumePanel.style.padding = '8px';
        volumePanel.style.borderRadius = '8px';
        volumePanel.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
        volumePanel.style.background = 'var(--cor-painel-fundo, #fff)';
        volumePanel.style.color = 'var(--cor-texto, #222)';
        volumePanel.style.minWidth = '120px';
        volumePanel.innerHTML = `
            <div style="margin-bottom: 6px; font-size: 0.85rem; color: #666;">Volume</div>
            <input type="range" id="volume-slider" min="0" max="100" value="100">
            <div id="volume-percentage" style="margin-top: 8px; font-size: 0.75rem; color: #666; text-align: right;">100%</div>
        `;
        document.body.appendChild(volumePanel);
    }

    volumeSlider = volumePanel.querySelector('#volume-slider');

    if (!volumeButton || !volumeSlider) return;

    // Eventos
    volumeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleVolumePanel();
    });

    volumeSlider.addEventListener('input', (e) => {
        const volume = Number(e.target.value) / 100;
        setVolume(volume);
    });

    // Fecha se clicar fora
    document.addEventListener('click', (e) => {
        if (isVolumeOpen && volumePanel && !volumePanel.contains(e.target) && e.target !== volumeButton) {
            hideVolumePanel();
        }
    });

    // Fecha quando o áudio começa a tocar (comportamento solicitado)
    document.addEventListener('statechange', (e) => {
        if (e && e.detail && e.detail.isPlaying) hideVolumePanel();
    });

    document.addEventListener('loaded', hideVolumePanel);
    document.addEventListener('unloaded', hideVolumePanel);

    // Inicializa valor do slider com o gain existente (se disponível)
    const gainNode = (typeof audioPlayer.getGainNode === 'function') ? audioPlayer.getGainNode() : null;
    let initialVolume = 1.0;
    try {
        if (gainNode && typeof gainNode.gain !== 'undefined') initialVolume = gainNode.gain.value;
    } catch (err) { /* noop */ }

    setVolume(initialVolume);

    // reposiciona se o usuário redimensionar a janela (mantém o panel perto do botão)
    window.addEventListener('resize', () => {
        if (isVolumeOpen) positionPanel();
    });

    console.log('Volume control initialized');
}

/**
 * Retorna o gainNode provindo do audioPlayer (se existir)
 */
export function getGainNode() {
    return (typeof audioPlayer.getGainNode === 'function') ? audioPlayer.getGainNode() : null;
}

/**
 * Força o fechamento do painel (útil para botões externos)
 */
export function closeVolumePanel() {
    hideVolumePanel();
}
