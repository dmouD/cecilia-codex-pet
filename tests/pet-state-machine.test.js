import test from 'node:test';
import assert from 'node:assert/strict';
import { PERSISTENT_STATES, PetStateMachine } from '../src/pet-state-machine.js';

function harness() {
  let nextId = 1;
  const pending = new Map();
  const warnings = [];
  const machine = new PetStateMachine({
    sleepAfterMs: 120000,
    setTimer(fn, delay) {
      const id = nextId++;
      pending.set(id, { fn, delay });
      return id;
    },
    clearTimer(id) {
      pending.delete(id);
    },
    logger: { warn(message) { warnings.push(message); } }
  });
  return {
    machine,
    pending,
    warnings,
    runOnlyTimer() {
      assert.equal(pending.size, 1);
      const [[id, { fn }]] = pending;
      pending.delete(id);
      fn();
    }
  };
}

test('exports the six persistent Cecilia pet states', () => {
  assert.deepEqual(PERSISTENT_STATES, [
    'idle', 'thinking', 'coding', 'success', 'error', 'sleeping'
  ]);
});

test('accepts persistent states and rejects unknown values without changing state', () => {
  const { machine, warnings } = harness();
  assert.equal(machine.setState('coding'), true);
  assert.equal(machine.state, 'coding');
  assert.equal(machine.setState('unknown'), false);
  assert.equal(machine.setState('unknown'), false);
  assert.equal(machine.state, 'coding');
  assert.deepEqual(warnings, ['Ignored unknown Cecilia pet state: unknown']);
});

test('clicked is transient and restores the previous persistent state', () => {
  const { machine } = harness();
  machine.setState('thinking');
  assert.equal(machine.playTransient('clicked'), true);
  assert.equal(machine.state, 'clicked');
  machine.finishTransient();
  assert.equal(machine.state, 'thinking');
  assert.equal(machine.playTransient('unsupported'), false);
});

test('idle sleeps after its configured inactivity delay and activity wakes it', () => {
  const { machine, pending, runOnlyTimer } = harness();
  assert.equal(pending.size, 1);
  assert.equal([...pending.values()][0].delay, 120000);
  runOnlyTimer();
  assert.equal(machine.state, 'sleeping');
  machine.noteActivity();
  assert.equal(machine.state, 'idle');
  assert.equal(pending.size, 1);
});

test('state changes cancel stale sleep timers and idle arms exactly one timer', () => {
  const { machine, pending } = harness();
  assert.equal(pending.size, 1);
  machine.setState('coding');
  assert.equal(pending.size, 0);
  machine.setState('idle');
  assert.equal(pending.size, 1);
  machine.noteActivity();
  assert.equal(pending.size, 1);
});

test('subscribers receive state changes and can unsubscribe', () => {
  const { machine } = harness();
  const states = [];
  const unsubscribe = machine.subscribe(state => states.push(state));
  machine.setState('success');
  unsubscribe();
  machine.setState('idle');
  assert.deepEqual(states, ['success']);
});

test('dispose clears the sleep timer and all subscriptions', () => {
  const { machine, pending } = harness();
  const states = [];
  machine.subscribe(state => states.push(state));
  machine.dispose();
  assert.equal(pending.size, 0);
  machine.setState('thinking');
  assert.deepEqual(states, []);
});
