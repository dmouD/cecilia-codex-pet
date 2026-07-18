export class PetStage {
  constructor(root, assets, {
    setTimer = globalThis.setTimeout.bind(globalThis),
    clearTimer = globalThis.clearTimeout.bind(globalThis),
    transitionMs = 120,
    prefersReducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } = {}) {
    this.root = root;
    this.assets = assets;
    this.image = root.querySelector('[data-pet-image]');
    this.companion = root.querySelector('[data-companion]');
    this.state = 'idle';
    this.timer = null;
    this.transitionTimer = null;
    this.transitionVersion = 0;
    this.hasRendered = false;
    this.isDisposed = false;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.transitionMs = Math.max(0, transitionMs);
    this.prefersReducedMotion = prefersReducedMotion;
    this.image.onerror = () => {
      if (this.image.dataset.fallback === 'true') return;
      this.#cancelTransition();
      this.image.classList.remove('is-switching');
      this.image.dataset.fallback = 'true';
      this.image.src = this.assets.idle;
    };
  }

  renderState(state) {
    if (this.isDisposed) return;
    this.state = state;
    this.root.dataset.state = state;
    const src = this.assets[state] ?? this.assets.idle;
    if (!this.hasRendered) {
      this.hasRendered = true;
      this.#showImage(src);
    } else {
      this.#transitionTo(src);
    }
    this.image.alt = `塞西莉亚宠物：${state}`;
  }

  setIdleEyes(open) {
    if (this.state !== 'idle' || this.transitionTimer !== null || this.image.classList.contains('is-switching')) return;
    this.#showImage(open ? this.assets.idleOpen : this.assets.idle);
  }

  showCompanion(durationMs = 1800) {
    this.companion.hidden = false;
    this.companion.classList.add('is-visible');
    if (this.timer !== null) this.clearTimer(this.timer);
    this.timer = this.setTimer(() => {
      this.companion.classList.remove('is-visible');
      this.companion.hidden = true;
      this.timer = null;
    }, durationMs);
  }

  dispose() {
    if (this.timer !== null) this.clearTimer(this.timer);
    this.timer = null;
    this.#cancelTransition();
    this.image.classList.remove('is-switching');
    this.isDisposed = true;
  }

  #showImage(src) {
    this.image.dataset.fallback = 'false';
    this.image.src = src;
  }

  #transitionTo(src) {
    this.#cancelTransition();
    this.image.classList.add('is-switching');
    const version = ++this.transitionVersion;
    const delay = this.prefersReducedMotion() ? 0 : this.transitionMs;

    if (delay === 0) {
      this.#showImage(src);
      this.image.classList.remove('is-switching');
      return;
    }

    let callbackRan = false;
    const timer = this.setTimer(() => {
      callbackRan = true;
      if (version !== this.transitionVersion || this.isDisposed) return;
      this.transitionTimer = null;
      this.#showImage(src);
      this.image.classList.remove('is-switching');
    }, delay);
    if (!callbackRan && version === this.transitionVersion && !this.isDisposed) {
      this.transitionTimer = timer;
    }
  }

  #cancelTransition() {
    if (this.transitionTimer !== null) this.clearTimer(this.transitionTimer);
    this.transitionTimer = null;
    this.transitionVersion += 1;
  }
}
