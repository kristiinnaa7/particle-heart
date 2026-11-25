import { useEffect, useRef } from "react";
import { Application } from "pixi.js";
import { burst, createHeart, resizeHeart, updateHeart } from "../lib/heart/index.js";

export default function ParticleHeart() {
  // Points at the <div> that will contain the Pixi canvas.
  const hostRef = useRef(null);

  useEffect(() => {
    let app;
    let disposed = false; // set to true by cleanup, so async setup can bail out
    let disconnect; // stops the ResizeObserver, assigned once it exists

    // Pixi v8 needs an async init, so setup lives in its own async function.
    async function start() {
      app = new Application();

      await app.init({
        background: "#070308",
        antialias: true,
        autoDensity: true,
        // Cap pixel density at 2 to keep 2,400 sprites fast on high-DPI screens.
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        powerPreference: "high-performance",
      });

      // React StrictMode cleans up the first mount before init() finishes.
      if (disposed) {
        app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true });
        return;
      }

      const host = hostRef.current;
      const canvas = app.canvas;
      const heart = createHeart(app); // builds the scene and returns the state object

      canvas.className = "particle-canvas";
      canvas.setAttribute("aria-label", "A glowing particle heart. Click it to make it burst.");
      host.appendChild(canvas);

      // Match the canvas to its container and tell the heart the new size.
      const resize = () => {
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);

        app.renderer.resize(width, height);
        resizeHeart(heart, width, height);
      };

      // Re-run resize whenever the container changes size, and once right now.
      const observer = new ResizeObserver(resize);
      observer.observe(host);
      resize();
      disconnect = () => observer.disconnect();

      // Track the pointer in canvas coordinates so particles can be pushed away.
      canvas.onpointermove = (event) => {
        const bounds = canvas.getBoundingClientRect();
        heart.pointer.x = event.clientX - bounds.left;
        heart.pointer.y = event.clientY - bounds.top;
        heart.pointer.active = true;
      };

      // Stop repelling particles when the pointer leaves the canvas.
      canvas.onpointerleave = () => {
        heart.pointer.active = false;
      };

      // Clicking near the heart triggers the burst (ignored mid-explosion).
      canvas.onpointerdown = (event) => {
        const bounds = canvas.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;

        if (!heart.exploded && Math.hypot(x - heart.centerX, y - heart.centerY) < heart.scale * 1.1) {
          burst(heart);
        }
      };

      // Run the simulation once per frame.
      app.ticker.add((ticker) => updateHeart(heart, ticker.deltaTime));
    }

    start();

    // Cleanup runs on unmount (and on StrictMode's extra mount/unmount in dev).
    return () => {
      disposed = true;
      disconnect?.();

      // app is assigned before init() resolves, so only destroy it once the
      // renderer exists. Otherwise PixiJS throws during StrictMode cleanup.
      if (app?.renderer) {
        app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true });
      }
    };
  }, []); // empty deps: set up once on mount

  return <div className="heart-stage" ref={hostRef} />;
}