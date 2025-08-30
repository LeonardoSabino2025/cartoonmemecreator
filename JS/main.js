/* JS/main.js */

import { initialize as initializeCharacterAPI } from './modules/character/character-api.js';
import * as audioHandler from './modules/left-panel/audio-handler.js';
import * as genderHandler from './modules/left-panel/gender-handler.js';
import * as moodHandler from './modules/left-panel/mood-handler.js';
import * as slidersHandler from './modules/left-panel/sliders-handler.js';
import { initialize as initializePlaybackHandler } from './modules/playback-panel/playback-handler.js';
import * as timelineController from './modules/timeline-controller.js';
import { initialize as initializeRightPanel } from './modules/right-panel/right-panel-handler.js';

function main() {
    // 1. Inicializa a API do Personagem primeiro
    const characterAPI = initializeCharacterAPI();

    // 2. Prepara a UI que vai OUVIR os eventos (playback e painel direito)
    initializePlaybackHandler();
    initializeRightPanel(characterAPI, timelineController);
    
    // 3. Prepara a UI que vai CAUSAR os eventos (painel esquerdo)
    audioHandler.initialize();
    genderHandler.initialize(characterAPI);
    moodHandler.initialize(characterAPI);
    slidersHandler.initialize(characterAPI);
    
    // 4. Conecta o player à animação do personagem
    document.addEventListener('timeupdate', (e) => {
        const animationData = e.detail.animationData;
        if (!animationData) return;

        if(animationData.expression) {
            characterAPI.setExpression(animationData.expression);
        }
        
        if(animationData.mouth) {
            characterAPI.setMouth(animationData.mouth);
        }
    });
    
    console.log("Sistema modular pronto e funcional.");
}

document.addEventListener('DOMContentLoaded', main);