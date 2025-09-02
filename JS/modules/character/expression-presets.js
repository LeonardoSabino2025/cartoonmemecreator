/* JS/modules/character/expression-presets.js */

/**
 * Define as combinações de olhos e boca para cada "Expressão do Rosto".
 * A chave (ex: 'feliz_sorrindo') será o valor guardado na timeline.
 * O 'label' e 'emoji' serão usados para criar os botões na UI.
 * O 'eyes' e 'mouth' são os valores que a API do personagem usará.
 */
export const expressionPresets = {
    // Coluna Feliz
    feliz_feliz: { label: 'Feliz', emoji: '😄', eyes: 'happy', mouth: 'feliz' },
    feliz_sorrindo: { label: 'Alegre', emoji: '😁', eyes: 'happy', mouth: 'sorrindo' },
    feliz_curioso: { label: 'Surpresa Boa', emoji: '😯', eyes: 'happy', mouth: 'curioso' },
    feliz_raiva: { label: 'Risada Maligna', emoji: '😈', eyes: 'happy', mouth: 'raiva' },
    feliz_lezo: { label: 'Bobo/Aéreo', emoji: '🤪', eyes: 'happy', mouth: 'lezo' },
    feliz_rindo: { label: 'Gargalhada', emoji: '😂', eyes: 'happy', mouth: 'rindo' },

    // Coluna Triste
    triste_feliz: { label: 'Chorando por Dentro', emoji: '🥲', eyes: 'sad', mouth: 'feliz' },
    triste_sorrindo: { label: 'Tentando Disfarçar', emoji: '🥹', eyes: 'sad', mouth: 'sorrindo' },
    triste_curioso: { label: 'Decepcionado', emoji: '😕', eyes: 'sad', mouth: 'curioso' },
    triste_raiva: { label: 'Frustrado', emoji: '😥', eyes: 'sad', mouth: 'raiva' },
    triste_lezo: { label: 'Desanimado', emoji: '😩', eyes: 'sad', mouth: 'lezo' },
    triste_rindo: { label: 'Chorando de Rir', emoji: '🤣', eyes: 'sad', mouth: 'rindo' },
    
    // Coluna Raiva
    raiva_feliz: { label: 'Irônico', emoji: '😏', eyes: 'angry', mouth: 'feliz' },
    raiva_sorrindo: { label: 'Agressivo', emoji: '😡', eyes: 'angry', mouth: 'sorrindo' },
    raiva_curioso: { label: 'Julgando', emoji: '🧐', eyes: 'angry', mouth: 'curioso' },
    raiva_raiva: { label: 'Furioso', emoji: '🤬', eyes: 'angry', mouth: 'raiva' },
    raiva_lezo: { label: 'Gritando', emoji: '🗣️', eyes: 'angry', mouth: 'lezo' },
    raiva_rindo: { label: 'Risada de Vilão', emoji: '🤡', eyes: 'angry', mouth: 'rindo' },

    // Coluna Curioso
    curioso_feliz: { label: 'Interessado', emoji: '🙂', eyes: 'curious', mouth: 'feliz' },
    curioso_sorrindo: { label: 'Ideia Brilhante', emoji: '💡', eyes: 'curious', mouth: 'sorrindo' },
    curioso_curioso: { label: 'Pensativo', emoji: '🤔', eyes: 'curious', mouth: 'curioso' },
    curioso_raiva: { label: 'Analisando Problema', emoji: '🤨', eyes: 'curious', mouth: 'raiva' },
    curioso_lezo: { label: 'Confuso', emoji: '😵', eyes: 'curious', mouth: 'lezo' },
    curioso_rindo: { label: 'Achou a Piada', emoji: '😆', eyes: 'curious', mouth: 'rindo' },
    
    // Coluna Desconfiado
    desconfiado_feliz: { label: 'Cúmplice', emoji: '😉', eyes: 'suspicious', mouth: 'feliz' },
    desconfiado_sorrindo: { label: 'Malicioso', emoji: '😈', eyes: 'suspicious', mouth: 'sorrindo' },
    desconfiado_curioso: { label: 'Investigativo', emoji: '🕵️', eyes: 'suspicious', mouth: 'curioso' },
    desconfiado_raiva: { label: 'Acusador', emoji: '😒', eyes: 'suspicious', mouth: 'raiva' },
    desconfiado_lezo: { label: 'Entediado', emoji: '😑', eyes: 'suspicious', mouth: 'lezo' },
    desconfiado_rindo: { label: 'Rindo de Lado', emoji: '😏', eyes: 'suspicious', mouth: 'rindo' },
    
    // Coluna Olhos Fechados
    fechados_feliz: { label: 'Satisfeito', emoji: '😌', eyes: 'closed', mouth: 'feliz' },
    fechados_sorrindo: { label: 'Contentamento', emoji: '😊', eyes: 'closed', mouth: 'sorrindo' },
    fechados_curioso: { label: 'Meditando', emoji: '🧘', eyes: 'closed', mouth: 'curioso' },
    fechados_raiva: { label: 'Dor / Esforço', emoji: '😣', eyes: 'closed', mouth: 'raiva' },
    fechados_lezo: { label: 'Dormindo', emoji: '😴', eyes: 'closed', mouth: 'lezo' },
    fechados_rindo: { label: 'Rindo Muito', emoji: '😂', eyes: 'closed', mouth: 'rindo' },
};