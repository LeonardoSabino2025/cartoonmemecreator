export function initialize(characterAPI) {
    const container = document.getElementById('mood-module');
    container.innerHTML = `
        <h3>Humor</h3>
        <div class="icon-buttons-container" id="mood-toggle">
            <button class="icon-button active" data-mood="feliz" title="Feliz">😄</button>
            <button class="icon-button" data-mood="sorrindo" title="Sorrindo">😊</button>
            <button class="icon-button" data-mood="curioso" title="Curioso">🤔</button>
            <button class="icon-button" data-mood="raiva" title="Raiva">😠</button>
            <button class="icon-button" data-mood="lezo" title="Lezo">😴</button>
        </div>
    `;

    const moodToggle = container.querySelector('#mood-toggle');
    moodToggle.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        moodToggle.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        characterAPI.setMouthMood(button.dataset.mood);
    });
}