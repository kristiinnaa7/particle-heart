import { Graphics, Sprite } from "pixi.js";
import { DOT_RADIUS } from "./constants.js";

// Draws one white circle and bakes it into a texture shared by all sprites. 
export function makeDotTexture(app) {
  const dot = new Graphics();
  // White so each sprite's tint can recolor it later.
  dot.circle(DOT_RADIUS, DOT_RADIUS, DOT_RADIUS).fill(0xffffff);
  // resolution: 2 renders the texture at double size to keep the dots crisp.
  return app.renderer.generateTexture({ target: dot, resolution: 2 });
}

/** Creates a centered dot sprite with the given diameter (in px) and opacity. */
export function makeSprite(texture, size, alpha) {
  const sprite = new Sprite(texture);
  // Center the sprite on its position, so x/y mark the middle of the dot.
  sprite.anchor.set(0.5);
  // The texture is DOT_RADIUS * 2 pixels wide, so this scales it to `size`.
  sprite.scale.set(size / (DOT_RADIUS * 2));
  sprite.alpha = alpha;
  return sprite;
}