import test from 'node:test';
import assert from 'node:assert/strict';
import { InteractionController, clampPosition, createDragController } from '../src/interaction-controller.js';
import * as interactionController from '../src/interaction-controller.js';
import { PetStateMachine } from '../src/pet-state-machine.js';

test('third click inside the window triggers the companion once', () => {
  const calls = [];
  const timers = [];
  const machine = {
    noteActivity() { calls.push('activity'); },
    playTransient() { calls.push('clicked'); },
    finishTransient() { calls.push('finish'); }
  };
  const controller = new InteractionController({
    machine,
    onCompanion() { calls.push('companion'); },
    setTimer(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    clearTimer() {}
  });

  controller.handleClick(100);
  controller.handleClick(400);
  controller.handleClick(700);

  assert.equal(calls.filter(value => value === 'companion').length, 1);
  timers.find(timer => timer.delay === 650).fn();
  assert.equal(calls.at(-1), 'finish');
});

test('click windows expire and do not create a companion', () => {
  const calls = [];
  const controller = new InteractionController({
    machine: { noteActivity() {}, playTransient() {}, finishTransient() {} },
    onCompanion() { calls.push('companion'); },
    setTimer() { return 1; },
    clearTimer() {}
  });

  controller.handleClick(0);
  controller.handleClick(901);
  controller.handleClick(1802);

  assert.deepEqual(calls, []);
});

test('a later click replaces its predecessor transient timer and dispose clears it', () => {
  const cleared = [];
  const timers = [];
  const controller = new InteractionController({
    machine: { noteActivity() {}, playTransient() {}, finishTransient() {} },
    onCompanion() {},
    setTimer(fn) { timers.push(fn); return timers.length; },
    clearTimer(id) { cleared.push(id); }
  });

  controller.handleClick(1);
  controller.handleClick(2);
  controller.dispose();

  assert.deepEqual(cleared, [1, 2]);
  assert.equal(timers.length, 2);
});

test('clampPosition keeps the dragged pet inside its stage', () => {
  assert.deepEqual(
    clampPosition({ x: 500, y: -20 }, { width: 320, height: 420 }, { width: 160, height: 280 }, 8),
    { x: 152, y: 8 }
  );
});

test('clampPosition preserves padding at every edge of a normal stage', () => {
  assert.deepEqual(
    clampPosition({ x: -1, y: 999 }, { width: 320, height: 420 }, { width: 160, height: 280 }, 8),
    { x: 8, y: 132 }
  );
});

test('drag controller suppresses the click emitted after a real drag', () => {
  const listeners = new Map();
  const element = {
    style: { setProperty() {} },
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener() {},
    setPointerCapture() {},
    parentElement: { getBoundingClientRect: () => ({ width: 320, height: 420 }) },
    getBoundingClientRect: () => ({ width: 160, height: 280 })
  };
  const drag = createDragController(element);
  listeners.get('pointerdown')({ pointerId: 1, clientX: 10, clientY: 10 });
  listeners.get('pointermove')({ pointerId: 1, clientX: 40, clientY: 50 });
  listeners.get('pointerup')({ pointerId: 1 });
  assert.equal(drag.consumeSuppressedClick(), true);
  assert.equal(drag.consumeSuppressedClick(), false);
});

test('drag controller clears click suppression when a real drag is cancelled', () => {
  const listeners = new Map();
  const element = {
    style: { setProperty() {} },
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener() {},
    setPointerCapture() {},
    parentElement: { getBoundingClientRect: () => ({ width: 320, height: 420 }) },
    getBoundingClientRect: () => ({ width: 160, height: 280 })
  };
  const drag = createDragController(element);

  listeners.get('pointerdown')({ pointerId: 1, clientX: 10, clientY: 10 });
  listeners.get('pointermove')({ pointerId: 1, clientX: 40, clientY: 50 });
  listeners.get('pointercancel')({ pointerId: 1 });

  assert.equal(drag.consumeSuppressedClick(), false);
});

test('drag controller reclamps a pet after its stage becomes smaller', () => {
  const listeners = new Map();
  const properties = new Map();
  let bounds = { width: 640, height: 720 };
  const element = {
    style: { setProperty(name, value) { properties.set(name, value); } },
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener() {},
    setPointerCapture() {},
    parentElement: { getBoundingClientRect: () => bounds },
    getBoundingClientRect: () => ({ width: 160, height: 280 })
  };
  const drag = createDragController(element);

  listeners.get('pointerdown')({ pointerId: 1, clientX: 0, clientY: 0 });
  listeners.get('pointermove')({ pointerId: 1, clientX: 999, clientY: 999 });
  assert.equal(properties.get('--pet-x'), '472px');
  assert.equal(properties.get('--pet-y'), '432px');

  bounds = { width: 320, height: 420 };
  drag.reclamp();

  assert.equal(properties.get('--pet-x'), '152px');
  assert.equal(properties.get('--pet-y'), '132px');
});

test('drag controller reports activity exactly once for each pointer-down', () => {
  const listeners = new Map();
  const activities = [];
  const element = {
    style: { setProperty() {} },
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener() {},
    setPointerCapture() {},
    parentElement: { getBoundingClientRect: () => ({ width: 320, height: 420 }) },
    getBoundingClientRect: () => ({ width: 160, height: 280 })
  };
  createDragController(element, { onActivity() { activities.push('activity'); } });

  listeners.get('pointerdown')({ pointerId: 1, clientX: 10, clientY: 10 });
  listeners.get('pointermove')({ pointerId: 1, clientX: 100, clientY: 100 });
  listeners.get('pointerdown')({ pointerId: 2, clientX: 20, clientY: 20 });

  assert.deepEqual(activities, ['activity', 'activity']);
});

test('drag activity wakes a sleeping state machine and restarts its idle timer', () => {
  const listeners = new Map();
  const timers = [];
  const machine = new PetStateMachine({
    setTimer(callback) { timers.push(callback); return timers.length; },
    clearTimer() {},
    logger: { warn() {} }
  });
  const element = {
    style: { setProperty() {} },
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener() {},
    setPointerCapture() {},
    parentElement: { getBoundingClientRect: () => ({ width: 320, height: 420 }) },
    getBoundingClientRect: () => ({ width: 160, height: 280 })
  };
  createDragController(element, { onActivity: () => machine.noteActivity() });

  timers[0]();
  assert.equal(machine.state, 'sleeping');

  listeners.get('pointerdown')({ pointerId: 1, clientX: 10, clientY: 10 });

  assert.equal(machine.state, 'idle');
  assert.equal(timers.length, 2);
});

test('idle companion sampling requires a continuous idle interval and resets on state activity', () => {
  const pending = new Map();
  const cleared = [];
  const companions = [];
  let nextTimer = 1;
  const randomValues = [.9, .1];
  const IdleCompanionController = interactionController.IdleCompanionController;
  const controller = new IdleCompanionController({
    onCompanion() { companions.push('peek'); },
    delayMs: 45000,
    chance: .15,
    random() { return randomValues.shift(); },
    setTimer(callback, delay) {
      const id = nextTimer++;
      pending.set(id, { callback, delay });
      return id;
    },
    clearTimer(id) {
      cleared.push(id);
      pending.delete(id);
    }
  });

  controller.syncState('idle');
  const firstTimer = 1;
  assert.equal(pending.get(firstTimer).delay, 45000);

  controller.syncState('idle');
  const secondTimer = 2;
  assert.deepEqual(cleared, [firstTimer]);
  assert.equal(pending.get(secondTimer).delay, 45000);

  controller.syncState('thinking');
  assert.deepEqual(cleared, [firstTimer, secondTimer]);
  assert.equal(pending.size, 0);

  controller.syncState('idle');
  const thirdTimer = 3;
  const firstSample = pending.get(thirdTimer);
  pending.delete(thirdTimer);
  firstSample.callback();
  assert.deepEqual(companions, []);
  assert.equal(pending.get(4).delay, 45000);

  const secondSample = pending.get(4);
  pending.delete(4);
  secondSample.callback();
  assert.deepEqual(companions, ['peek']);
  assert.equal(pending.get(5).delay, 45000);

  controller.dispose();
  assert.deepEqual(cleared, [firstTimer, secondTimer, 5]);
  assert.equal(pending.size, 0);
});

test('idle companion keeps the rescheduled timer when the first timer fires synchronously', () => {
  const pending = new Map();
  const cleared = [];
  let nextTimer = 1;
  const IdleCompanionController = interactionController.IdleCompanionController;
  const controller = new IdleCompanionController({
    onCompanion() {},
    random() { return .9; },
    setTimer(callback) {
      const id = nextTimer++;
      if (id === 1) callback();
      else pending.set(id, callback);
      return id;
    },
    clearTimer(id) {
      cleared.push(id);
      pending.delete(id);
    }
  });

  controller.syncState('idle');
  controller.dispose();

  assert.deepEqual(cleared, [2]);
  assert.equal(pending.size, 0);
});
