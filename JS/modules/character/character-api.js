/* JS/modules/character/character-api.js - VERSÃO DEFINITIVA */

import * as dom from './character-dom.js';

const moodToSvgMap = {
    feliz: 'FELIZ.svg', sorrindo: 'SORRINDO.svg', curioso: 'CURIOSO.svg',
    raiva: 'RAIVA.svg', lezo: 'LEZO.svg',
};

const api = {
    /**
     * Define o gênero do personagem. Em vez de 'toggle', agora remove
     * explicitamente uma classe e adiciona a outra para garantir o estado correto.
     */
    setGender: (gender) => {
        if (!dom.eyesContainer) return;

        if (gender === 'female') {
            dom.eyesContainer.classList.remove('male');
            dom.eyesContainer.classList.add('female');
        } else {
            dom.eyesContainer.classList.remove('female');
            dom.eyesContainer.classList.add('male');
        }
    },
    
    setMouthMood: (mood) => {
        if (dom.mouthImage) dom.mouthImage.src = `BOCAS/${moodToSvgMap[mood] || 'FELIZ.svg'}`;
    },
    
    setMouthSize: (size) => {
        if (dom.mouthContainer) dom.mouthContainer.style.width = `${size}px`;
    },
    
    setEyeDistance: (distance) => {
        if (dom.eyesContainer) dom.eyesContainer.style.gap = `${distance}px`;
    },
    
    setMouthYPosition: (distance) => {
        if (dom.mouthContainer) dom.mouthContainer.style.marginTop = `${distance}px`;
    },

    setExpression: (expression) => {
        if (dom.eyesContainer) {
            dom.eyesContainer.classList.remove('happy', 'sad', 'angry', 'curious', 'suspicious');
            if (expression) {
                dom.eyesContainer.classList.add(expression);
            }
        }
    }
};

/**
 * ATUALIZADO: Função central que lê a timeline e atualiza o personagem.
 * @param {number} time - O tempo atual da animação.
 */
api.updateFromTimeline = function(time, timelineController) {
    const expression = timelineController.getValueAtTime('expression', time);
    if (expression) {
        this.setExpression(expression);
    }
    // No futuro, faremos o mesmo para olhar, posição, etc.
    // const gaze = timelineController.getValueAtTime('gaze', time);
    // if (gaze) this.setGaze(gaze);
};

/**
 * Inicializa o estado visual do personagem e retorna o objeto da API.
 */
export function initialize() {
    if (document.readyState === 'loading') {
        console.warn('Character API initialized before DOM was ready.');
        return;
    }
    
    // Define o estado visual inicial do personagem
    api.setGender('male'); // Garante que a classe .male seja adicionada no início
    api.setMouthMood('feliz');
    api.setMouthSize(320);
    api.setEyeDistance(20);
    api.setMouthYPosition(20);
    api.setExpression('happy');
    
    return api;
}