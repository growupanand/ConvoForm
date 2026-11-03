// Ported from the Stageshow kit (MIT, see LICENSE in this folder).

export class Stopped extends Error {}

type Timer = { at: number; fire: () => void };

/**
 * A scene's own clock. It only advances while `start()`ed (the stage is on
 * screen and the tab is visible), so every wait in a script freezes off-screen
 * and resumes where it stopped. One frame never advances it by more than
 * 100ms, so a throttled tab does not jump ahead.
 */
export class SceneClock {
  private now = 0;
  private last: number | null = null;
  private raf = 0;
  private running = false;
  private timers = new Set<Timer>();
  private frames = new Set<() => void>();

  get time() {
    return this.now;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = null;
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private tick = (t: number) => {
    if (!this.running) return;
    const dt = this.last === null ? 0 : Math.min(100, t - this.last);
    this.last = t;
    this.now += dt;
    const frames = [...this.frames];
    this.frames.clear();
    for (const fire of frames) fire();
    for (const timer of [...this.timers]) {
      if (timer.at > this.now) continue;
      this.timers.delete(timer);
      timer.fire();
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private schedule(
    signal: AbortSignal,
    add: (fire: () => void) => () => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(new Stopped());
      const abort = () => {
        remove();
        reject(new Stopped());
      };
      const remove = add(() => {
        signal.removeEventListener("abort", abort);
        resolve();
      });
      signal.addEventListener("abort", abort, { once: true });
    });
  }

  wait(ms: number, signal: AbortSignal) {
    return this.schedule(signal, (fire) => {
      const timer = { at: this.now + ms, fire };
      this.timers.add(timer);
      return () => this.timers.delete(timer);
    });
  }

  frame(signal: AbortSignal) {
    return this.schedule(signal, (fire) => {
      this.frames.add(fire);
      return () => this.frames.delete(fire);
    });
  }
}
