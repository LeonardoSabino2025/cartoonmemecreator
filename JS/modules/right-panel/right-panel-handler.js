/* JS/modules/right-panel/right-panel-handler.js */

import { initialize as initFaceExpressionHandler } from './face-expression-handler.js';

export function initialize(characterAPI) {
    // Inicializa o novo handler unificado, que construirá toda a UI do painel direito
    initFaceExpressionHandler(characterAPI);
}