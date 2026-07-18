export function clampPosition(point, bounds, pet, padding = 8) {
  return {
    x: Math.min(Math.max(point.x, padding), bounds.width - pet.width - padding),
    y: Math.min(Math.max(point.y, padding), bounds.height - pet.height - padding)
  };
}

export class InteractionController {
  constructor({
    machine,
    onCompanion,
    clickWindowMs = 900,
    transientMs = 650,
    setTimer = globalThis.setTimeout.bind(globalThis),
    clearTimer = globalThis.clearTimeout.bind(globalThis)
  }) {
    this.machine = machine;
    this.onCompanion = onCompanion;
    this.clickWindowMs = clickWindowMs;
    this.transientMs = transientMs;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.clicks = [];
    this.transientTimer = null;
  }

  handleClick(now = Date.now()) {
    this.machine.noteActivity();
    this.machine.playTransient('clicked');
    this.clicks = this.clicks.filter(time => now - time <= this.clickWindowMs);
    this.clicks.push(now);
    if (this.clicks.length >= 3) {
      this.clicks = [];
      this.onCompanion();
    }
    if (this.transientTimer !== null) this.clearTimer(this.transientTimer);
    this.transientTimer = this.setTimer(() => {
      this.transientTimer = null;
      this.machine.finishTransient();
    }, this.transientMs);
  }

  dispose() {
    if (this.transientTimer !== null) this.clearTimer(this.transientTimer);
    this.transientTimer = null;
  }
}
