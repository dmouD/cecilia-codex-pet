import test from 'node:test';
import assert from 'node:assert/strict';
import { PetStage } from '../src/pet-stage.js';

function fakeRoot() {
  const image = { src: '', alt: '', dataset: {}, onerror: null };
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

const assets = {
  idle: '/idle.png',
  idleOpen: '/open.png',
  thinking: '/thinking.png',
  clicked: '/idle.png'
};

test('renderer maps known states and falls back to the approved master for unknown states', () => {
  const root = fakeRoot();
  const stage = new PetStage(root, assets);

  stage.renderState('thinking');
  assert.equal(root.image.src, '/thinking.png');
  assert.equal(root.dataset.state, 'thinking');
  assert.equal(root.image.alt, '塞西莉亚宠物：thinking');

  stage.renderState('unknown');
  assert.equal(root.image.src, '/idle.png');
  assert.equal(root.dataset.state, 'unknown');
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
