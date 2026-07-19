import test from 'node:test';
import assert from 'node:assert/strict';
import { PetStage } from '../src/pet-stage.js';

function fakeRoot() {
  const imageClasses = new Set();
  const image = {
    src: '',
    alt: '',
    dataset: {},
    onerror: null,
    classList: {
      add(className) { imageClasses.add(className); },
      remove(className) { imageClasses.delete(className); },
      contains(className) { return imageClasses.has(className); }
    }
  };
  const visibleClasses = new Set();
  const buddy = {
    hidden: true,
    classList: {
      add(className) { visibleClasses.add(className); },
      remove(className) { visibleClasses.delete(className); },
      contains(className) { return visibleClasses.has(className); }
    }
  };

  return {
    image,
    buddy,
    dataset: {},
    querySelector(selector) {
      if (selector === '[data-pet-image]') return image;
      if (selector === '[data-companion]') return buddy;
      return null;
    }
  };
}

function fakeTimers() {
  const timers = [];
  const clearedTimers = [];

  return {
    timers,
    clearedTimers,
    setTimer(callback, duration) {
      const timer = { callback, duration };
      timers.push(timer);
      return timer;
    },
    clearTimer(timer) { clearedTimers.push(timer); }
  };
}

const assets = {
  idle: '/idle.png',
  idleOpen: '/open.png',
  thinking: '/thinking.png',
  clicked: '/idle.png'
};

test('renderer maps known states and falls back to the approved master for unknown states', () => {
  const root = fakeRoot();
  const stage = new PetStage(root, assets, { transitionMs: 0 });

  stage.renderState('thinking');
  assert.equal(root.image.src, '/thinking.png');
  assert.equal(root.dataset.state, 'thinking');
  assert.equal(root.image.alt, '塞西莉亚宠物：thinking');

  stage.renderState('unknown');
  assert.equal(root.image.src, '/idle.png');
  assert.equal(root.dataset.state, 'unknown');
});

test('first state renders immediately, then later states fade out before their source changes', () => {
  const root = fakeRoot();
  const clock = fakeTimers();
  const stage = new PetStage(root, assets, { ...clock, transitionMs: 120 });

  stage.renderState('idle');
  assert.equal(root.image.src, '/idle.png');
  assert.equal(root.image.classList.contains('is-switching'), false);

  stage.renderState('thinking');
  assert.equal(root.image.src, '/idle.png');
  assert.equal(root.image.classList.contains('is-switching'), true);
  assert.equal(clock.timers[0].duration, 120);

  clock.timers[0].callback();
  assert.equal(root.image.src, '/thinking.png');
  assert.equal(root.image.classList.contains('is-switching'), false);
});

test('a rapid sequence of states commits only the latest source', () => {
  const root = fakeRoot();
  const clock = fakeTimers();
  const stage = new PetStage(root, assets, { ...clock, transitionMs: 120 });

  stage.renderState('idle');
  stage.renderState('thinking');
  const staleTimer = clock.timers[0];
  stage.renderState('clicked');
  const latestTimer = clock.timers[1];

  assert.deepEqual(clock.clearedTimers, [staleTimer]);
  staleTimer.callback();
  assert.equal(root.image.src, '/idle.png');
  assert.equal(root.image.classList.contains('is-switching'), true);

  latestTimer.callback();
  assert.equal(root.image.src, '/idle.png');
  assert.equal(root.image.classList.contains('is-switching'), false);
});

test('idle eye frames do not replace an image while a state transition is pending', () => {
  const root = fakeRoot();
  const clock = fakeTimers();
  const stage = new PetStage(root, assets, { ...clock, transitionMs: 120 });

  stage.renderState('thinking');
  stage.renderState('idle');
  stage.setIdleEyes(true);

  assert.equal(root.image.src, '/thinking.png');
  clock.timers[0].callback();
  assert.equal(root.image.src, '/idle.png');
});

test('reduced motion changes subsequent state images immediately without a transition timer', () => {
  const root = fakeRoot();
  const clock = fakeTimers();
  const stage = new PetStage(root, assets, {
    ...clock,
    transitionMs: 120,
    prefersReducedMotion: () => true
  });

  stage.renderState('idle');
  stage.renderState('thinking');

  assert.equal(root.image.src, '/thinking.png');
  assert.equal(root.image.classList.contains('is-switching'), false);
  assert.deepEqual(clock.timers, []);
});

test('image load errors fall back to the approved master only once', () => {
  const root = fakeRoot();
  const stage = new PetStage(root, assets);

  stage.renderState('thinking');
  root.image.onerror();
  assert.equal(root.image.src, '/idle.png');
  assert.equal(root.image.dataset.fallback, 'true');

  root.image.src = '/broken-fallback.png';
  root.image.onerror();
  assert.equal(root.image.src, '/broken-fallback.png');
});

test('an idle eye-frame load error also falls back to the approved master', () => {
  const root = fakeRoot();
  const stage = new PetStage(root, assets);

  stage.renderState('idle');
  stage.setIdleEyes(true);
  root.image.onerror();

  assert.equal(root.image.src, '/idle.png');
});

test('open-eye frame is used only while idle', () => {
  const root = fakeRoot();
  const stage = new PetStage(root, assets);

  stage.renderState('idle');
  stage.setIdleEyes(true);
  assert.equal(root.image.src, '/open.png');
  stage.setIdleEyes(false);
  assert.equal(root.image.src, '/idle.png');

  stage.renderState('clicked');
  stage.setIdleEyes(true);
  assert.equal(root.image.src, '/idle.png');
});

test('showCompanion replaces the previous timer and hides the companion after its duration', () => {
  const root = fakeRoot();
  const callbacks = [];
  const clearedTimers = [];
  const stage = new PetStage(root, assets, {
    setTimer(callback, duration) {
      const timer = { callback, duration };
      callbacks.push(timer);
      return timer;
    },
    clearTimer(timer) { clearedTimers.push(timer); }
  });

  stage.showCompanion(100);
  const firstTimer = callbacks[0];
  assert.equal(root.buddy.hidden, false);
  assert.equal(root.buddy.classList.contains('is-visible'), true);

  stage.showCompanion(200);
  const secondTimer = callbacks[1];
  assert.deepEqual(clearedTimers, [firstTimer]);
  assert.equal(secondTimer.duration, 200);

  secondTimer.callback();
  assert.equal(root.buddy.hidden, true);
  assert.equal(root.buddy.classList.contains('is-visible'), false);
});

test('rendering a different state hides a visible companion and clears its timer', () => {
  const root = fakeRoot();
  const clock = fakeTimers();
  const stage = new PetStage(root, assets, { ...clock, transitionMs: 0 });

  stage.showCompanion(200);
  const companionTimer = clock.timers[0];
  assert.equal(root.buddy.hidden, false);

  stage.renderState('thinking');

  assert.equal(root.buddy.hidden, true);
  assert.equal(root.buddy.classList.contains('is-visible'), false);
  assert.deepEqual(clock.clearedTimers, [companionTimer]);
});

test('dispose clears a pending companion timer', () => {
  const root = fakeRoot();
  const clearedTimers = [];
  const stage = new PetStage(root, assets, {
    setTimer() { return 'timer'; },
    clearTimer(timer) { clearedTimers.push(timer); }
  });

  stage.showCompanion();
  stage.dispose();
  stage.dispose();

  assert.deepEqual(clearedTimers, ['timer']);
});

test('dispose cancels a pending image transition and removes its fading class', () => {
  const root = fakeRoot();
  const clock = fakeTimers();
  const stage = new PetStage(root, assets, { ...clock, transitionMs: 120 });

  stage.renderState('idle');
  stage.renderState('thinking');
  const transitionTimer = clock.timers[0];
  stage.dispose();

  assert.deepEqual(clock.clearedTimers, [transitionTimer]);
  assert.equal(root.image.classList.contains('is-switching'), false);

  transitionTimer.callback();
  assert.equal(root.image.src, '/idle.png');
});
