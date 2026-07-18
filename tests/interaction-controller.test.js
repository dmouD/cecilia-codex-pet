import test from 'node:test';
import assert from 'node:assert/strict';
import { InteractionController, clampPosition } from '../src/interaction-controller.js';

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
