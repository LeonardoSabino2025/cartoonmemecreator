/* JS/modules/left-panel/gender-handler.js */

export function initialize(characterAPI) {
    const container = document.getElementById('gender-module');
    container.innerHTML = `
        <h3>Gênero</h3>
        <div class="segmented-control" id="gender-toggle">
            <button data-gender="male" class="active">Masculino</button>
            <button data-gender="female">Feminino</button>
        </div>
    `;

    const genderToggle = container.querySelector('#gender-toggle');
    genderToggle.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        genderToggle.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const gender = button.dataset.gender;
        characterAPI.setGender(gender);
        
        // Dispara um evento personalizado para que outros módulos saibam da mudança
        const genderChangeEvent = new CustomEvent('genderChanged', {
            detail: { gender: gender }
        });
        document.dispatchEvent(genderChangeEvent);
    });
}