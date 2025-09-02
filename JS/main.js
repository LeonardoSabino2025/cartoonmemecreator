/* JS/main.js */

import { initialize as initializeCharacterAPI } from './modules/character/character-api.js';
import * as audioHandler from './modules/left-panel/audio-handler.js';
import * as genderHandler from './modules/left-panel/gender-handler.js';
import * as slidersHandler from './modules/left-panel/sliders-handler.js';
import { initialize as initializePlaybackHandler } from './modules/playback-panel/playback-handler.js';
import { initialize as initializeWaveformHandler } from './modules/playback-panel/waveform-handler.js';
import * as timelineController from './modules/timeline-controller.js';
import { initialize as initializeRightPanel } from './modules/right-panel/right-panel-handler.js';
import { initialize as initializeGazeHud } from './modules/stage/gaze-hud-handler.js';


function main() {
    const characterAPI = initializeCharacterAPI();

    initializePlaybackHandler();
    initializeWaveformHandler();
    initializeRightPanel(characterAPI, timelineController);
    audioHandler.initialize();
    genderHandler.initialize(characterAPI);
    slidersHandler.initialize(characterAPI);
    initializeGazeHud(characterAPI, timelineController);
    
    // Listener que conecta o player de áudio com a API do personagem
    document.addEventListener('timeupdate', (e) => {
        const { animationData } = e.detail;
        if (!animationData) return;
        
        if (animationData.eyes) {
            characterAPI.setExpression(animationData.eyes);
        }
        
        if (animationData.mouth) {
            characterAPI.setMouth(animationData.mouth);
        }
        
        if (animationData.gaze) {
            characterAPI.setGaze(animationData.gaze.x, animationData.gaze.y);
        }

        if (animationData.gender) {
            characterAPI.setGender(animationData.gender);
        }
    });
    
    console.log("Sistema com HUD pronto.");
}

document.addEventListener('DOMContentLoaded', main);