import { Container } from "pixi.js";
import { STAR_COUNT, TAU } from "./constants.js";
import { makeSprite } from "./textures.js";

//  Scatters tiny dim dots across the canvas as a starry background.
export function makeStars(texture, width, height) {
  const layer = new Container();

  for (let i = 0; i < STAR_COUNT; i++) {
    // Very small random size (0.35 to 1.45 px) and a faint starting opacity.
    const star = makeSprite(texture, 0.35 + Math.random() * 1.1, 0.12 + Math.random() * 0.35);

    // Every third star is pink, the rest are pale lavender.
    star.tint = i % 3 === 0 ? 0xff9aa9 : 0xb9a7c8;
    // Random position anywhere on the canvas.
    star.x = Math.random() * width;
    star.y = Math.random() * height;
    // Random offset so the stars twinkle out of step (used in updateHeart).
    star.phase = Math.random() * TAU;

    layer.addChild(star);
  }

  return layer;
}