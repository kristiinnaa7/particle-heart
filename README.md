# Particle Heart

A small interactive particle heart built with React, Vite and PixiJS 8.

Thousands of particles form a softly beating heart in the center of the screen. Move the pointer through it to ripple the particles, and click the heart to scatter them and watch them reform.

## Requirements

- Node.js 18.18+ (Node 20+ recommended)
- npm

## Getting started

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## Scripts

| Command           | Description           |
| ----------------- | --------------------- |
| `npm run dev`     | Start the dev server  |
| `npm run build`   | Build for production  |
| `npm run preview` | Preview the built app |

## Project structure

```text
particle-heart/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── components/
    │   └── ParticleHeart.jsx
    └── lib/
        └── heart/
            ├── index.js
            ├── heart.js
            ├── constants.js
            ├── geometry.js
            ├── textures.js
            ├── stars.js
            └── particles.js
```

- `index.js` — public exports for the heart module.
- `heart.js` — creates the scene and runs the animation (`createHeart`, `resizeHeart`, `burst`, `updateHeart`).
- `constants.js` — particle counts, sizes and other tunables.
- `geometry.js` — the heart curve and the particle target points.
- `textures.js` — the shared dot texture and sprite setup.
- `stars.js` — the background star field.
- `particles.js` — the heart's particle sprites and state.

`components/ParticleHeart.jsx` is the React wrapper: Pixi lifecycle, resizing and pointer input.

## Tuning

- `PARTICLE_COUNT` and `STAR_COUNT` in `src/lib/heart/constants.js`.
- `MAX_HEART_SIZE`, `HEART_SIZE_RATIO` and `POINTER_RADIUS` in `src/lib/heart/constants.js`.
- Spring, damping and burst values in `updateHeart()` and `burst()` in `src/lib/heart/heart.js`.
- `heartPoint()` in `src/lib/heart/geometry.js` defines the heart outline.
