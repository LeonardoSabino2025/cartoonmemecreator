# Studio de Animação Facial v3 (GEMINI)

Um estúdio de animação facial baseado na web para criar animações de personagens 2D com sincronia labial (lip sync) a partir de um arquivo de áudio.

## Arquitetura

Este projeto utiliza uma arquitetura de micro-módulos para máxima organização e manutenibilidade. A lógica e os estilos são divididos em domínios (personagem, painéis, palco) para garantir que cada parte do código seja pequena, focada e independente.

- **`index.html`**: Ponto de entrada único da aplicação.
- **`CSS/`**: Contém os estilos globais e os módulos de estilo de cada componente.
- **`JS/`**: Contém a lógica da aplicação, com um orquestrador (`main.js`) e módulos para cada funcionalidade.
- **`BOCAS/`**: Contém os assets SVG para os fonemas e humores da boca.

```
Studio de Animação_ver3-GEMINI
├─ BOCAS
│  ├─ A.svg
│  ├─ BMP.svg
│  ├─ CDGKNSTXYZ.svg
│  ├─ CURIOSO.svg
│  ├─ E.svg
│  ├─ FELIZ.svg
│  ├─ FVI.svg
│  ├─ H.svg
│  ├─ L.svg
│  ├─ LEZO.svg
│  ├─ NG.svg
│  ├─ O.svg
│  ├─ Q.svg
│  ├─ R.svg
│  ├─ RAIVA.svg
│  ├─ SORRINDO.svg
│  ├─ TH.svg
│  ├─ U.svg
│  ├─ W.svg
│  └─ ZH.svg
├─ CSS/
│  ├─ main.css
│  └─ modules/
│     ├─ character/
│     │  ├─ eyes.css
│     │  └─ mouth.css
│     ├─ left-panel/
│     │  ├─ buttons.css
│     │  └─ sliders.css
│     └─ stage/
│        └─ stage-layout.css
├─ index.html
├─ JS/
│  ├─ libs/
│  │  └─ html2canvas.min.js
│  ├─ main.js
│  └─ modules/
│     ├─ character/
│     │  ├─ character-api.js
│     │  └─ character-dom.js
│     └─ left-panel/
│        ├─ audio-handler.js
│        ├─ gender-handler.js
│        ├─ mood-handler.js
│        └─ sliders-handler.js
└─ README.md

```