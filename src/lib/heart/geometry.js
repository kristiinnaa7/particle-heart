import { TAU } from "./constants.js";

export function heartPoint(t) {
  return {
    // Dividing by 17 scales the shape to roughly [-1, 1].
    x: (16 * Math.sin(t) ** 3) / 17,
    // Minus sign flips y, because screen y grows downward.
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17,
  };
}

// Point-in-polygon test (ray casting): shoot a ray to the right and count how many outline edges it crosses. An odd count means the point is inside.
function isInsideHeart(point, outline) {
  let inside = false;

  // j trails one step behind i, so (a, b) is each edge of the outline.
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i];
    const b = outline[j];
    const crosses =
      // The edge spans the point's height...
      a.y > point.y !== b.y > point.y &&
      // ...and the point is left of where the edge crosses that height.
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || 0.000001) + a.x;

    if (crosses) inside = !inside;
  }

  return inside;
}

// Random points filling the heart, centered on the origin. 
export function makeTargets(count) {
  // The outline is only used to test whether random points fall inside the heart.
  const outline = Array.from({ length: 220 }, (_, i) => heartPoint((i / 220) * TAU));
  // The heart isn't vertically symmetric, so find its middle to center it on y = 0.
  const ys = outline.map((point) => point.y);
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  const targets = [];

  // Rejection sampling: pick random points in a box slightly larger than the
  // heart and keep only the ones that land inside it.
  while (targets.length < count) {
    const point = {
      x: Math.random() * 2.05 - 1.025,
      y: Math.random() * 2.05 - 1.025,
    };

    if (isInsideHeart(point, outline)) targets.push({ x: point.x, y: point.y - centerY });
  }

  return targets;
}