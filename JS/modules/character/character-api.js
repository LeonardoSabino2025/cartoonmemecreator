/* JS/modules/character/character-api.js */

import * as dom from './character-dom.js';
import { expressionPresets } from './expression-presets.js';

const mouthMap = {
    a: 'A.svg', e: 'E.svg', i: 'FVI.svg', o: 'O.svg', u: 'U.svg',
    m: 'BMP.svg', ch: 'CDGKNSTXYZ.svg', l: 'L.svg', r: 'R.svg',    
    feliz: 'FELIZ.svg', sorrindo: 'SORRINDO.svg', curioso: 'CURIOSO.svg',
    raiva: 'RAIVA.svg', lezo: 'LEZO.svg', rindo: 'RINDO.svg'
};

const api = {
    setGender: (gender) => {
        if (!dom.eyesContainer) return;
        dom.eyesContainer.classList.toggle('female', gender === 'female');
    },
    
    /**
     * Controla a posição da íris com base nas coordenadas X e Y (-1 a 1).
     * @param {number} gazeX - Posição horizontal de -1 (esquerda) a 1 (direita).
     * @param {number} gazeY - Posição vertical de -1 (cima) a 1 (baixo).
     */
    setGaze: (gazeX, gazeY) => {
        if (!dom.irisElements) return;
        const radius = 35;
        const x = radius * gazeX;
        const y = radius * gazeY;

        dom.irisElements.forEach(iris => {
            iris.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });
    },  

    setMouth: (key) => {
        if (!key || !dom.mouthImage) return;
        const svgFile = mouthMap[key];
        if (svgFile && !dom.mouthImage.src.endsWith(svgFile)) {
            dom.mouthImage.src = `BOCAS/${svgFile}`;
        }
    },

    setMouthSize: (size) => {
        if (dom.mouthContainer) dom.mouthContainer.style.width = `${size}px`;
    },
    
    setEyeDistance: (distance) => {
        if (dom.rightEye) dom.rightEye.style.marginLeft = `${distance}px`;
    },
    
    setMouthYPosition: (distance) => {
        if (dom.mouthContainer) dom.mouthContainer.style.marginTop = `${distance}px`;
    },

    setExpression: (expression) => {
        if (dom.eyesContainer) {
            dom.eyesContainer.classList.remove('happy', 'sad', 'angry', 'curious', 'suspicious', 'closed');
            if (expression) {
                dom.eyesContainer.classList.add(expression);
            }
        }
    },

    setFaceExpression: (key) => {
        const preset = expressionPresets[key];
        if (!preset) return;
        api.setExpression(preset.eyes);
        api.setMouth(preset.mouth);
    }
};

export function initialize() {
    if (document.readyState === 'loading') {
        console.warn('Character API initialized before DOM was ready.');
        return;
    }
    
    api.setGender('male');
    api.setMouth('feliz');
    api.setMouthSize(320);
    api.setEyeDistance(20);
    api.setMouthYPosition(20);
    api.setExpression('happy');
    api.setGaze(0, 0);
    
    return api;
}