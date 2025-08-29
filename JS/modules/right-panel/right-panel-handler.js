/* JS/modules/right-panel/right-panel-handler.js */

import { initialize as initAnimationMode } from './animation-mode-handler.js';
import { initialize as initExpression } from './expression-handler.js';

export function initialize(characterAPI, timelineController) {
    const container = document.getElementById('right-panel');
    container.innerHTML = `
        <h2 class="panel-title">Animação</h2>
        <div class="control-group" id="animation-mode-module"></div>
        <div class="control-group" id="expression-module"></div>
        `;

    // Inicializa cada submódulo do painel direito
    initAnimationMode(timelineController);
    initExpression(characterAPI, timelineController);
}