export function clampPosition(point, bounds, pet, padding = 8) {
  return {
    x: Math.min(Math.max(point.x, padding), bounds.width - pet.width - padding),
    y: Math.min(Math.max(point.y, padding), bounds.height - pet.height - padding)
  };
}

export function createDragController(element, { padding = 8 } = {}) {
  let active = null;
  let position = { x: padding, y: padding };
  let suppressClick = false;

  function pointerDown(event) {
    active = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: position };
    element.setPointerCapture?.(event.pointerId);
  }

  function pointerMove(event) {
    if (!active || active.id !== event.pointerId) return;
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    if (Math.hypot(dx, dy) > 6) suppressClick = true;
    const bounds = element.parentElement.getBoundingClientRect();
    const pet = element.getBoundingClientRect();
    position = clampPosition({ x: active.origin.x + dx, y: active.origin.y + dy }, bounds, pet, padding);
    element.style.setProperty('--pet-x', `${position.x}px`);
    element.style.setProperty('--pet-y', `${position.y}px`);
  }

  function pointerUp(event) {
    if (active?.id === event.pointerId) active = null;
  }

  function pointerCancel(event) {
    if (active?.id !== event.pointerId) return;
    active = null;
    suppressClick = false;
  }

  element.addEventListener('pointerdown', pointerDown);
  element.addEventListener('pointermove', pointerMove);
  element.addEventListener('pointerup', pointerUp);
  element.addEventListener('pointercancel', pointerCancel);

  return {
    consumeSuppressedClick() {
      const value = suppressClick;
      suppressClick = false;
      return value;
    },
    destroy() {
      element.removeEventListener('pointerdown', pointerDown);
      element.removeEventListener('pointermove', pointerMove);
      element.removeEventListener('pointerup', pointerUp);
      element.removeEventListener('pointercancel', pointerCancel);
    }
  };
}

export class IdleCompanionController {
  constructor({
    onCompanion,
    delayMs = 45000,
    chance = .15,
    random = Math.random,
    setTimer = globalThis.setTimeout.bind(globalThis),
    clearTimer = globalThis.clearTimeout.bind(globalThis)
  }) {
    this.onCompanion = onCompanion;
    this.delayMs = delayMs;
    this.chance = chance;
    this.random = random;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.state = null;
    this.timer = null;
    this.generation = 0;
  }

  syncState(state) {
    this.state = state;
    this.clearScheduled();
    if (state === 'idle') this.schedule();
  }

  schedule() {
    const generation = ++this.generation;
    let firedSynchronously = false;
    const timer = this.setTimer(() => {
      firedSynchronously = true;
      if (this.generation !== generation) return;
      this.timer = null;
      if (this.state !== 'idle') return;
      if (this.random() < this.chance) this.onCompanion();
      if (this.generation === generation && this.state === 'idle') this.schedule();
    }, this.delayMs);
    if (this.generation === generation && !firedSynchronously) this.timer = timer;
  }

  clearScheduled() {
    this.generation += 1;
    if (this.timer !== null) this.clearTimer(this.timer);
    this.timer = null;
  }

  dispose() {
    this.clearScheduled();
    this.state = null;
  }
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
