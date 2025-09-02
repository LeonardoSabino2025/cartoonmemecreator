/* JS/modules/stage/gaze-hud-handler.js */

import audioPlayer from '../playback-panel/audio-player.js';
import * as timelineController from '../timeline-controller.js';

export function initialize(characterAPI) {
    const container = document.getElementById('gaze-hud-container');
    if (!container) return;
    
    container.innerHTML = `<div id="gaze-hud" data-html2canvas-ignore></div>`;

    const hud = document.getElementById('gaze-hud');
    const stage = document.getElementById('stage');
    
    let isDragging = false;
    
    function onMouseDown(e) {
        e.preventDefault();
        isDragging = true;
        hud.style.transition = 'none';
        hud.style.cursor = 'grabbing';
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const stageRect = stage.getBoundingClientRect();
        
        let x = e.clientX - stageRect.left;
        let y = e.clientY - stageRect.top;

        x = Math.max(hud.offsetWidth / 2, Math.min(x, stageRect.width - hud.offsetWidth / 2));
        y = Math.max(hud.offsetHeight / 2, Math.min(y, stageRect.height - hud.offsetHeight / 2));

        hud.style.left = `${x}px`;
        hud.style.top = `${y}px`;

        const gazeX = (x / stageRect.width) * 2 - 1;
        const gazeY = (y / stageRect.height) * 2 - 1;

        characterAPI.setGaze(gazeX, gazeY);
    }

    function onMouseUp(e) {
        if (!isDragging) return;
        isDragging = false;
        hud.style.transition = 'transform 0.2s ease-out';
        hud.style.cursor = 'grab';

        const stageRect = stage.getBoundingClientRect();
        const x = hud.offsetLeft;
        const y = hud.offsetTop;
        const gazeX = (x / stageRect.width) * 2 - 1;
        const gazeY = (y / stageRect.height) * 2 - 1;

        const currentTime = audioPlayer.getCurrentTime();
        timelineController.addKeyframe('gaze', currentTime, { x: gazeX, y: gazeY });
    }

    hud.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}