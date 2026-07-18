export class PetStage {
  constructor(root, assets, {
    setTimer = globalThis.setTimeout.bind(globalThis),
    clearTimer = globalThis.clearTimeout.bind(globalThis)
  } = {}) {
    this.root = root;
    this.assets = assets;
    this.image = root.querySelector('[data-pet-image]');
    this.companion = root.querySelector('[data-companion]');
    this.state = 'idle';
    this.timer = null;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.image.onerror = () => {
      if (this.image.dataset.fallback === 'true') return;
      this.image.dataset.fallback = 'true';
      this.image.src = this.assets.idle;
    };
  }

  renderState(state) {
    this.state = state;
    this.root.dataset.state = state;
    this.#showImage(this.assets[state] ?? this.assets.idle);
    this.image.alt = `塞西莉亚宠物：${state}`;
  }

  setIdleEyes(open) {
    if (this.state !== 'idle') return;
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
  }

  #showImage(src) {
    this.image.dataset.fallback = 'false';
    this.image.src = src;
  }
}
