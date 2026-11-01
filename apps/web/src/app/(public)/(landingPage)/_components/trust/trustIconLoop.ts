import type { TrustIconName } from "./trustIconName";
import { buildTrustIconScene } from "./trustIconScene";

type Scene = ReturnType<typeof buildTrustIconScene>;

type TrustIconItem = {
  svg: SVGSVGElement;
  scene: Scene;
  visible: boolean;
  time: number;
  ready: boolean;
  onReady?: () => void;
};

const items = new Map<SVGSVGElement, TrustIconItem>();

let observer: IntersectionObserver | null = null;
let animationFrame = 0;
let last = 0;
let listenersAttached = false;
let motionQuery: MediaQueryList | null = null;

function anyVisible() {
  for (const item of items.values()) {
    if (item.visible) return true;
  }
  return false;
}

function stop() {
  if (animationFrame !== 0) {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }
}

function loop(now: number) {
  animationFrame = requestAnimationFrame(loop);

  const delta = Math.min(0.1, (now - last) / 1000);
  last = now;

  for (const item of items.values()) {
    if (!item.visible) continue;

    item.time += delta;
    item.scene.render(item.time);

    if (!item.ready) {
      item.ready = true;
      item.onReady?.();
    }
  }
}

function start() {
  if (
    animationFrame !== 0 ||
    document.hidden ||
    motionQuery?.matches ||
    !anyVisible()
  ) {
    return;
  }

  last = performance.now();
  animationFrame = requestAnimationFrame(loop);
}

function handleVisibility() {
  if (document.hidden) stop();
  else start();
}

function handleMotion() {
  if (motionQuery?.matches) stop();
  else start();
}

function ensureListeners() {
  if (listenersAttached) return;

  listenersAttached = true;
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.addEventListener("visibilitychange", handleVisibility);
  motionQuery.addEventListener("change", handleMotion);
}

function cleanupListeners() {
  if (!listenersAttached) return;

  listenersAttached = false;
  document.removeEventListener("visibilitychange", handleVisibility);
  motionQuery?.removeEventListener("change", handleMotion);
  motionQuery = null;
}

function ensureObserver() {
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const item = items.get(entry.target as SVGSVGElement);
        if (!item) continue;

        item.visible = entry.isIntersecting;
        if (entry.isIntersecting) start();
        else if (!anyVisible()) stop();
      }
    },
    { threshold: 0.2 },
  );

  return observer;
}

export function registerTrustIcon({
  svg,
  icon,
  onReady,
}: {
  svg: SVGSVGElement;
  icon: TrustIconName;
  onReady?: () => void;
}) {
  const item: TrustIconItem = {
    svg,
    scene: buildTrustIconScene(svg, icon),
    visible: false,
    time: 0,
    ready: false,
    onReady,
  };

  item.scene.render(0);
  items.set(svg, item);
  ensureListeners();
  ensureObserver().observe(svg);

  return () => {
    items.delete(svg);
    observer?.unobserve(svg);
    svg.innerHTML = "";

    if (!anyVisible()) stop();

    if (items.size === 0) {
      observer?.disconnect();
      observer = null;
      cleanupListeners();
    }
  };
}
