export class DemoController {
  constructor({
    setState,
    sequence = ['thinking', 'coding', 'success', 'idle', 'error', 'idle'],
    intervalMs = 4000,
    setTimer = globalThis.setTimeout.bind(globalThis),
    clearTimer = globalThis.clearTimeout.bind(globalThis)
  }) {
    this.setState = setState;
    this.sequence = sequence;
    this.intervalMs = intervalMs;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.index = 0;
    this.timer = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.schedule();
  }

  schedule() {
    this.timer = this.setTimer(() => {
      if (!this.isRunning) return;
      this.setState(this.sequence[this.index]);
      this.index = (this.index + 1) % this.sequence.length;
      this.schedule();
    }, this.intervalMs);
  }

  stop() {
    this.isRunning = false;
    if (this.timer !== null) this.clearTimer(this.timer);
    this.timer = null;
  }
}
