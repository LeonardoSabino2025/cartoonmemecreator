/* JS/modules/character/character-api.js */

import * as dom from './character-dom.js';

// Mapeamento central de todas as bocas disponíveis.
// Associa uma chave simples (ex: 'a', 'feliz') a um arquivo SVG.
const mouthMap = {
    // Fonemas
    a: 'A.svg',
    e: 'E.svg',
    i: 'FVI.svg',
    o: 'O.svg',
    u: 'U.svg',
    m: 'BMP.svg',
    ch: 'CDGKNSTXYZ.svg',
    l: 'L.svg',
    r: 'R.svg',
    // Humores
    feliz: 'FELIZ.svg',
    sorrindo: 'SORRINDO.svg',
    curioso: 'CURIOSO.svg',
    raiva: 'RAIVA.svg',
    lezo: 'LEZO.svg',
};

const api = {
    /**
     * Define o gênero do personagem. Remove a classe de um gênero e adiciona a do outro
     * para garantir que os estados CSS não se sobreponham.
     * @param {string} gender - 'male' ou 'female'.
     */
    setGender: (gender) => {
        if (!dom.eyesContainer) return;

        if (gender === 'female') {
            dom.eyesContainer.classList.remove('male');
            dom.eyesContainer.classList.add('female');
        } else {
            dom.eyesContainer.classList.remove('female');
            dom.eyesContainer.classList.add('male');
        }
    },
    
    /**
     * Função central para trocar a imagem da boca.
     * Usada tanto pelo humor quanto pela animação de lip sync.
     * @param {string} key - A chave do fonema ou humor (ex: 'a', 'feliz').
     */
    setMouth: (key) => {
        if (!key || !dom.mouthImage) return;
        const svgFile = mouthMap[key];
        // Verifica se o arquivo existe no mapa e se a imagem já não é a correta
        if (svgFile && !dom.mouthImage.src.endsWith(svgFile)) {
            dom.mouthImage.src = `BOCAS/${svgFile}`;
        }
    },

    /**
     * Atalho para definir a boca de humor. Agora, apenas chama a função setMouth.
     * @param {string} mood - O nome do humor.
     */
    setMouthMood: (mood) => {
        api.setMouth(mood);
    },

    /**
     * Define a largura do container da boca.
     * @param {number} size - A largura em pixels.
     */
    setMouthSize: (size) => {
        if (dom.mouthContainer) dom.mouthContainer.style.width = `${size}px`;
    },
    
    /**
     * Define a distância entre os olhos controlando a margem do olho direito.
     * Permite valores negativos para sobreposição.
     * @param {number} distance - A distância em pixels.
     */
    setEyeDistance: (distance) => {
        if (dom.rightEye) dom.rightEye.style.marginLeft = `${distance}px`;
    },
    
    /**
     * Define a distância vertical entre os olhos e a boca.
     * @param {number} distance - A distância em pixels.
     */
    setMouthYPosition: (distance) => {
        if (dom.mouthContainer) dom.mouthContainer.style.marginTop = `${distance}px`;
    },

    /**
     * Define a expressão facial alterando a classe no container dos olhos.
     * @param {string} expression - O nome da expressão (ex: 'happy', 'sad').
     */
    setExpression: (expression) => {
        if (dom.eyesContainer) {
            // Primeiro, remove todas as classes de expressão possíveis para evitar conflitos.
            dom.eyesContainer.classList.remove('happy', 'sad', 'angry', 'curious', 'suspicious');
            // Adiciona a nova classe de expressão, se ela existir.
            if (expression) {
                dom.eyesContainer.classList.add(expression);
            }
        }
    }
};

/**
 * Inicializa o estado visual padrão do personagem quando a aplicação carrega.
 * @returns {object} - Retorna o objeto da API para ser usado por outros módulos.
 */
export function initialize() {
    if (document.readyState === 'loading') {
        console.warn('Character API initialized before DOM was ready.');
        return;
    }
    
    api.setGender('male');
    api.setMouthMood('feliz');
    api.setMouthSize(320);
    api.setEyeDistance(20);
    api.setMouthYPosition(20);
    api.setExpression('happy');
    
    return api;
}