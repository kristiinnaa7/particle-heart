import { Container } from "pixi.js";
import { PARTICLE_COUNT, TAU } from "./constants.js";
import { makeTargets } from "./geometry.js";
import { makeSprite } from "./textures.js";

//  Creates one sprite per heart point, plus the data the animation needs. 
export function makeParticles(texture) {
  const layer = new Container();
  // One particle per target point; the targets are the spots that form the heart.
  const particles = makeTargets(PARTICLE_COUNT).map((target) => {
    const shade = Math.random();
    // Random size (1 to 3.5 px) and random starting opacity.
    const sprite = makeSprite(texture, 1 + Math.random() * 2.5, 0.48 + Math.random() * 0.5);

    // Pick a color by chance: 56% deep red, 27% pink, 17% pale pink.
    sprite.tint = shade < 0.56 ? 0xff244f : shade < 0.83 ? 0xff6b83 : 0xffb4c0;
    layer.addChild(sprite);

    return {
      sprite,
      // Current position; resizeHeart places it once the canvas size is known.
      x: 0,
      y: 0,
      // Small random starting velocity so particles don't all move in sync.
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      // Home spot inside the heart, in normalized coordinates (about -1 to 1).
      targetX: target.x,
      targetY: target.y,
      // Random offset so each particle wobbles and twinkles out of step.
      phase: Math.random() * TAU,
      // Remembered so the twinkle can scale around the original opacity.
      baseAlpha: sprite.alpha,
    };
  });

  return { layer, particles };
}