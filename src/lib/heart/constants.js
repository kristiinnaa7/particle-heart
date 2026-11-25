// A full turn in radians (JavaScript has no built-in Math.TAU).
export const TAU = Math.PI * 2;

// How many dots make up the heart and the starry background.
export const PARTICLE_COUNT = 2400;
export const STAR_COUNT = 160;

// Radius of the base dot texture, in pixels (sprites are scaled from this).
export const DOT_RADIUS = 12;
// How far from the pointer particles get pushed away, in pixels.
export const POINTER_RADIUS = 105;
// Upper limit for the heart's size, in pixels.
export const MAX_HEART_SIZE = 340;
// The heart's size as a fraction of the canvas's smaller side.
export const HEART_SIZE_RATIO = 0.4;

// The two glow circles behind the heart, in pixels (before scaling).
export const HALO_RADIUS = 150;
export const HALO_INNER_RADIUS = 105;
// Heart size at which the halo is drawn at its natural, unscaled size.
export const HALO_SCALE_REFERENCE = 180;