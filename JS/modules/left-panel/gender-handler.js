/* JS/modules/left-panel/gender-handler.js */

import * as timelineController from '../timeline-controller.js';
import audioPlayer from '../playback-panel/audio-player.js';


export function initialize(characterAPI) {
    const container = document.getElementById('gender-module');
    if (!container) {
        console.error('Módulo de Gênero não encontrado no HTML.');
        return;
    }

    container.innerHTML = `
        <h3>Gênero</h3>
        <div class="segmented-control" id="gender-toggle">
            <button data-gender="male" class="active">Masculino</button>
            <button data-gender="female">Feminino</button>
        </div>
    `;

    const genderToggle = container.querySelector('#gender-toggle');
    if (!genderToggle) return;

    genderToggle.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        genderToggle.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const gender = button.dataset.gender;
        characterAPI.setGender(gender);        

        const currentTime = audioPlayer.getCurrentTime();
        if (audioPlayer.getDuration() > 0) { // Só grava se houver áudio
             timelineController.addKeyframe('gender', currentTime, gender);
        }
        
        const genderChangeEvent = new CustomEvent('genderChanged', {
            detail: { gender: gender }


        });
        
        document.dispatchEvent(genderChangeEvent);
    });
}