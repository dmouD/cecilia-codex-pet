import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoController } from '../src/demo-controller.js';

test('demo advances through the declared sequence and stops cleanly', () => {
  const states = [];
  let pending = null;
  const demo = new DemoController({
    setState(state) { states.push(state); },
    sequence: ['thinking', 'coding'],
    intervalMs: 4000,
    setTimer(fn) { pending = fn; return 1; },
    clearTimer() { pending = null; }
  });

  demo.start();
  pending();
  assert.deepEqual(states, ['thinking']);
  demo.stop();
  assert.equal(demo.isRunning, false);
});

test('repeated start schedules one loop and cycles the sequence stably', () => {
  const states = [];
  const timers = new Map();
  let nextId = 1;
  const demo = new DemoController({
    setState(state) { states.push(state); },
    sequence: ['thinking', 'coding'],
    setTimer(fn) { const id = nextId++; timers.set(id, fn); return id; },
    clearTimer(id) { timers.delete(id); }
  });

  demo.start();
  demo.start();
  assert.equal(timers.size, 1);
  for (let index = 0; index < 3; index += 1) {
    const [[id, fn]] = timers;
    timers.delete(id);
    fn();
  }

  assert.deepEqual(states, ['thinking', 'coding', 'thinking']);
  assert.equal(timers.size, 1);
});

test('stop clears the scheduled loop', () => {
  const cleared = [];
  const demo = new DemoController({
    setState() {},
    setTimer() { return 4; },
    clearTimer(id) { cleared.push(id); }
  });

  demo.start();
  demo.stop();

  assert.deepEqual(cleared, [4]);
  assert.equal(demo.isRunning, false);
});
