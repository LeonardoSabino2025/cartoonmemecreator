/* JS/modules/character/character-state.js */

const characterState = {
    animationMode: 'auto',
    mood: 'feliz',
};

export function setAnimationMode(mode) {
    characterState.animationMode = mode;
}

export function setMood(mood) {
    characterState.mood = mood;
}

export function getState() {
    return characterState;
}