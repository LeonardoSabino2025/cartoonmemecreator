/* JS/modules/character/character-state.js */

const characterState = {
    animationMode: 'auto',
    mood: 'feliz',
    // ATUALIZADO: Valor inicial da sensibilidade alterado para 85 (Alto)
    sensitivity: 85,
};

/**
 * Define o modo de animação atual (auto/manual).
 * @param {string} mode 
 */
export function setAnimationMode(mode) {
    characterState.animationMode = mode;
}

/**
 * Define o humor/boca padrão para silêncio.
 * @param {string} mood 
 */
export function setMood(mood) {
    characterState.mood = mood;
}

/**
 * Define o nível de sensibilidade do lip sync.
 * @param {number} value 
 */
export function setSensitivity(value) {
    characterState.sensitivity = parseInt(value, 10);
}

/**
 * Retorna o objeto de estado completo.
 * @returns {object}
 */
export function getState() {
    return characterState;
}