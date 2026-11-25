import { Container, Graphics } from "pixi.js";
import {
  HALO_INNER_RADIUS,
  HALO_RADIUS,
  HALO_SCALE_REFERENCE,
  HEART_SIZE_RATIO,
  MAX_HEART_SIZE,
  POINTER_RADIUS,
} from "./constants.js";
import { makeParticles } from "./particles.js";
import { makeStars } from "./stars.js";
import { makeDotTexture } from "./textures.js";

export function createHeart(app) {
  // One shared dot texture is reused by every star and particle sprite.
  const texture = makeDotTexture(app);
  const stars = makeStars(texture, app.screen.width, app.screen.height);
  const { layer, particles } = makeParticles(texture);
  const halo = new Graphics();

  // Two faint overlapping circles make a soft glow behind the heart.
  halo.circle(0, 0, HALO_RADIUS).fill({ color: 0xff174c, alpha: 0.035 });
  halo.circle(0, 0, HALO_INNER_RADIUS).fill({ color: 0xff174c, alpha: 0.035 });

  // Draw order, back to front: halo, stars, particles.
  const scene = new Container();
  scene.addChild(halo, stars, layer);
  app.stage.addChild(scene);

  // This object is the shared state: the functions below read and change it.
  return {
    particles,
    stars,
    halo,
    centerX: 0, // screen position of the heart's center (set in resizeHeart)
    centerY: 0,
    scale: 1, // heart size in pixels (set in resizeHeart)
    pointer: { x: 0, y: 0, active: false },
    exploded: false, // true while a burst is playing out
    explosionAge: 0, // seconds since the burst started
    time: 0, // animation clock, in seconds
  };
}

// Recalculates position and size whenever the canvas changes size. 
export function resizeHeart(heart, width, height) {
  // centerX is still 0 only before the very first resize.
  const firstResize = heart.centerX === 0;

  heart.centerX = width / 2;
  heart.centerY = height / 2;
  // Size is a fraction of the smaller side, but never larger than the max.
  heart.scale = Math.min(width * HEART_SIZE_RATIO, height * HEART_SIZE_RATIO, MAX_HEART_SIZE);

  // Place the particles in formation the first time we know the size.
  if (firstResize) {
    for (const particle of heart.particles) {
      particle.x = heart.centerX + particle.targetX * heart.scale;
      particle.y = heart.centerY + particle.targetY * heart.scale;
    }
  }

  // Move any stars that are now off-screen back into view.
  for (const star of heart.stars.children) {
    if (star.x > width || star.y > height) {
      star.x = Math.random() * width;
      star.y = Math.random() * height;
    }
  }
}

//  Pushes every particle away from the heart's center.
export function burst(heart) {
  for (const particle of heart.particles) {
    // Direction from the center to this particle (|| 1 avoids dividing by zero).
    const dx = particle.x - heart.centerX;
    const dy = particle.y - heart.centerY;
    const distance = Math.hypot(dx, dy) || 1;
    const force = 5 + Math.random() * 13;

    // Kick outward along that direction, plus a little random sideways scatter.
    particle.vx += (dx / distance) * force + (Math.random() - 0.5) * 5;
    particle.vy += (dy / distance) * force + (Math.random() - 0.5) * 5;
  }

  heart.exploded = true;
  heart.explosionAge = 0;
}

/** Advances the simulation by one frame. */
export function updateHeart(heart, deltaTime) {
  // Cap the step so a lag spike or background tab doesn't make particles jump.
  const dt = Math.min(deltaTime, 2);
  // 0.016 is roughly one frame at 60fps, so these clocks count in seconds.
  heart.time += dt * 0.016;
  if (heart.exploded) heart.explosionAge += dt * 0.016;

  // Heartbeat: a short sharp pulse (the high power keeps it flat between beats)
  // plus a slow, subtle breathing sway.
  const beat = 1 + Math.max(0, Math.sin(heart.time * 2.8)) ** 12 * 0.045;
  const scale = heart.scale * beat * (1 + Math.sin(heart.time * 1.4) * 0.012);
  // While exploded: less friction and a weaker spring, so particles drift far.
  const damping = (heart.exploded ? 0.986 : 0.88) ** dt;
  const spring = heart.exploded ? 0.0018 : 0.018;

  // Keep the halo centered, and make it pulse in size and brightness.
  heart.halo.x = heart.centerX;
  heart.halo.y = heart.centerY;
  heart.halo.scale.set((scale / HALO_SCALE_REFERENCE) * (1 + Math.sin(heart.time * 2) * 0.08));
  heart.halo.alpha = 0.75 + Math.sin(heart.time * 2) * 0.12;

  for (const particle of heart.particles) {
    // Each particle's home spot, with a tiny circular wobble so the heart shimmers.
    const wobble = heart.time + particle.phase;
    const targetX = heart.centerX + particle.targetX * scale + Math.sin(wobble) * 1.8;
    const targetY = heart.centerY + particle.targetY * scale + Math.cos(wobble) * 1.8;

    // Spring force pulls each dot toward its home in the heart.
    particle.vx += (targetX - particle.x) * spring * dt;
    particle.vy += (targetY - particle.y) * spring * dt;

    // The pointer gently repels nearby particles.
    if (heart.pointer.active) {
      const dx = particle.x - heart.pointer.x;
      const dy = particle.y - heart.pointer.y;
      const distance = Math.hypot(dx, dy);

      // Push is strongest at the pointer and fades to zero at POINTER_RADIUS.
      if (distance > 0 && distance < POINTER_RADIUS) {
        const force = (1 - distance / POINTER_RADIUS) * 1.5 * dt;
        particle.vx += (dx / distance) * force;
        particle.vy += (dy / distance) * force;
      }
    }

    // Friction slows the particle, then velocity moves it.
    particle.vx *= damping;
    particle.vy *= damping;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;

    // Copy the result onto the sprite, with a gentle individual twinkle.
    particle.sprite.x = particle.x;
    particle.sprite.y = particle.y;
    particle.sprite.alpha = particle.baseAlpha * (0.82 + Math.sin(heart.time * 3 + particle.phase) * 0.18);
  }

  // After the burst has travelled outward, the spring draws the heart back together.
  if (heart.exploded && heart.explosionAge > 1.05) heart.exploded = false;

  // Slow twinkle for the background stars.
  for (const star of heart.stars.children) {
    star.alpha = 0.12 + (Math.sin(heart.time * 1.5 + star.phase) + 1) * 0.13;
  }
}