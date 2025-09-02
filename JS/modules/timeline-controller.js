/* JS/modules/timeline-controller.js */

const timelines = {
    faceExpression: [],
    gaze: [],
    gender: [],
    phoneme: []
};

/**
 * Adiciona ou atualiza um keyframe em uma timeline específica.
 * @param {string} type - O tipo da timeline (ex: 'expression', 'gaze').
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
    const existingIndex = timeline.findIndex(k => k.time === timeInSeconds);

    if (existingIndex > -1) {
        // CORREÇÃO: Apenas atualiza o valor se o keyframe já existe
        timeline[existingIndex].value = value;
    } else {
        timeline.push({ time: timeInSeconds, value });
    }

    timeline.sort((a, b) => a.time - b.time);
    
    const event = new CustomEvent('timelineUpdated', { detail: { type, timelines: getTimeline(type) } });
    document.dispatchEvent(event);
}


export function getValueAtTime(type, time) {
    const timeline = timelines[type];
    if (!timeline || timeline.length === 0) {
        // Valores padrão para cada trilha
        if (type === 'faceExpression') return 'feliz_feliz';
        if (type === 'gaze') return { x: 0, y: 0 }; 
        if (type === 'gender') return 'male';
        return null;
    }
    
    let activeKeyframe = { time: -1, value: null };
    // Define os valores iniciais (padrão) para cada trilha
    if (type === 'faceExpression') activeKeyframe.value = 'feliz_feliz';
    if (type === 'gaze') activeKeyframe.value = { x: 0, y: 0 };
    if (type === 'gender') activeKeyframe.value = 'male';

    for (const keyframe of timeline) {
        if (keyframe.time <= time) {
            activeKeyframe = keyframe;
        } else {
            break;
        }
    }
    return activeKeyframe.value;
}

export function getTimeline(type) {
    return timelines[type] || [];
}

/**
 * Retorna uma lista única e ordenada de todos os tempos de keyframe de todas as timelines.
 * @returns {number[]} - Array de tempos em segundos.
 */
export function getAllKeyframeTimes() {
    const allTimes = new Set();
    Object.values(timelines).forEach(timeline => {
        timeline.forEach(keyframe => {
            allTimes.add(keyframe.time);
        });
    });
    return Array.from(allTimes).sort((a, b) => a - b);
}