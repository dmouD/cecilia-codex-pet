export const PERSISTENT_STATES = Object.freeze([
  'idle', 'thinking', 'coding', 'success', 'error', 'sleeping'
]);

const VALID_STATES = new Set(PERSISTENT_STATES);

export class PetStateMachine {
  constructor({
    sleepAfterMs = 120000,
    setTimer = globalThis.setTimeout.bind(globalThis),
    clearTimer = globalThis.clearTimeout.bind(globalThis),
    logger = console
  } = {}) {
    this.persistentState = 'idle';
    this.transientState = null;
    this.listeners = new Set();
    this.sleepAfterMs = sleepAfterMs;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.logger = logger;
    this.warnedStates = new Set();
    this.sleepTimer = null;
    this.armSleep();
  }

  get state() {
    return this.transientState ?? this.persistentState;
  }

  setState(next) {
    if (!VALID_STATES.has(next)) {
      const stateName = String(next);
      if (!this.warnedStates.has(stateName)) {
        this.warnedStates.add(stateName);
        this.logger.warn(`Ignored unknown Cecilia pet state: ${stateName}`);
      }
      return false;
    }

    this.transientState = null;
    this.persistentState = next;
    this.cancelSleep();
    if (next === 'idle') this.armSleep();
    this.emit();
    return true;
  }

  playTransient(name) {
    if (name !== 'clicked') return false;
    this.transientState = name;
    this.emit();
    return true;
  }

  finishTransient() {
    if (this.transientState === null) return;
    this.transientState = null;
    this.emit();
  }

  noteActivity() {
    if (this.persistentState === 'sleeping') this.persistentState = 'idle';
    this.cancelSleep();
    if (this.persistentState === 'idle') this.armSleep();
    this.emit();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispose() {
    this.cancelSleep();
    this.listeners.clear();
  }

  armSleep() {
    this.sleepTimer = this.setTimer(() => {
      this.sleepTimer = null;
      this.persistentState = 'sleeping';
      this.transientState = null;
      this.emit();
    }, this.sleepAfterMs);
  }

  cancelSleep() {
    if (this.sleepTimer !== null) this.clearTimer(this.sleepTimer);
    this.sleepTimer = null;
  }

  emit() {
    for (const listener of this.listeners) listener(this.state);
  }
}
