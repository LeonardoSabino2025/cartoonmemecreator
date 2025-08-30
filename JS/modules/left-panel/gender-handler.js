/* JS/modules/left-panel/gender-handler.js */

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
        
        // Dispara o evento para que o slider de distância dos olhos possa reagir
        const genderChangeEvent = new CustomEvent('genderChanged', {
            detail: { gender: gender }
        });
        document.dispatchEvent(genderChangeEvent);
    });
}