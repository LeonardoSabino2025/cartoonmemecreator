/* JS/modules/timeline-controller.js */

// Estrutura de dados para armazenar os keyframes
const timelines = {
    expression: [],
    gaze: [],
    position: [],
    phoneme: []
};

/**
 * Adiciona ou atualiza um keyframe em uma timeline específica.
 * @param {string} type - O tipo da timeline (ex: 'expression').
 * @param {number} time - O tempo do keyframe em segundos.
 * @param {any} value - O valor do keyframe.
 */
export function addKeyframe(type, time, value) {
    if (!timelines[type]) {
        console.error(`Timeline do tipo "${type}" não existe.`);
        return;
    }

    const timeInSeconds = parseFloat(time.toFixed(2));
    const timeline = timelines[type];

    // Remove qualquer keyframe existente neste exato momento
    const existingIndex = timeline.findIndex(k => k.time === timeInSeconds);
    if (existingIndex > -1) {
        timeline.splice(existingIndex, 1);
    }

    // Adiciona o novo keyframe e mantém a timeline ordenada
    timeline.push({ time: timeInSeconds, value });
    timeline.sort((a, b) => a.time - b.time);
    
    // Dispara um evento para a UI se atualizar
    const event = new CustomEvent('timelineUpdated', { detail: { type, timelines } });
    document.dispatchEvent(event);
}

/**
 * Pega o valor que deveria estar ativo em um determinado momento do tempo.
 * @param {string} type - O tipo da timeline.
 * @param {number} time - O tempo atual em segundos.
 * @returns {any} O valor do último keyframe válido ou null.
 */
export function getValueAtTime(type, time) {
    const timeline = timelines[type];
    if (!timeline || timeline.length === 0) {
        return null;
    }
    
    // Encontra o último keyframe cujo tempo é menor ou igual ao tempo atual
    let activeKeyframe = null;
    for (const keyframe of timeline) {
        if (keyframe.time <= time) {
            activeKeyframe = keyframe;
        } else {
            break; // Otimização, já que a lista está ordenada
        }
    }
    
    return activeKeyframe ? activeKeyframe.value : null;
}

// Outras funções de utilidade
export function getTimelines() {
    return timelines;
}