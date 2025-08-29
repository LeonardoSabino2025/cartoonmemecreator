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
    const characterAPI = initializeCharacterAPI();

    audioHandler.initialize();
    genderHandler.initialize(characterAPI);
    moodHandler.initialize(characterAPI);
    slidersHandler.initialize(characterAPI);
    
    // INICIALIZA O NOVO PAINEL
    initializePlaybackHandler();
    initializeRightPanel(characterAPI, timelineController);

    document.addEventListener('timeupdate', (e) => {
        if(e.detail.animationData.expression) {
            characterAPI.setExpression(e.detail.animationData.expression);
        }
    });
    
    console.log("Sistema modular com painel de playback pronto.");
}

document.addEventListener('DOMContentLoaded', main);

