/* JS/modules/right-panel/right-panel-handler.js */

import { initialize as initAnimationMode } from './animation-mode-handler.js';
import { initialize as initExpression } from './expression-handler.js';
// NOVO IMPORT
import { initialize as initPhoneme } from './phoneme-handler.js';

export function initialize(characterAPI, timelineController) {
    const container = document.getElementById('right-panel');
    container.innerHTML = `
        <h2 class="panel-title">Animação</h2>
        <div class="control-group" id="animation-mode-module"></div>
        <div class="control-group" id="expression-module"></div>
        <div class="control-group" id="phoneme-module"></div>
    `;

    // Inicializa cada submódulo do painel direito
    initAnimationMode(timelineController);
    initExpression(characterAPI, timelineController);
    // INICIALIZA O NOVO MÓDULO
    initPhoneme(characterAPI, timelineController);
}