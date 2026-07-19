import { PetStateMachine } from './pet-state-machine.js';
import { IdleCompanionController, InteractionController, createDragController } from './interaction-controller.js';
import { DemoController } from './demo-controller.js';
import { PET_ASSETS } from './pet-manifest.js';
import { PetStage } from './pet-stage.js';

const labels = { idle: '待机', thinking: '思考中', coding: '写代码', success: '完成', error: '报错', sleeping: '睡觉', clicked: '回应' };
const root = document.querySelector('#pet-stage');
const character = document.querySelector('#pet-character');
const stateLabel = document.querySelector('#state-label');
const demoButton = document.querySelector('#demo-toggle');
const stateButtons = document.querySelectorAll('[data-set-state]');
const machine = new PetStateMachine();
const stage = new PetStage(root, PET_ASSETS);
const demo = new DemoController({ setState: state => machine.setState(state) });
const interactions = new InteractionController({ machine, onCompanion: () => stage.showCompanion() });
const drag = createDragController(character, { onActivity: () => machine.noteActivity() });
const idleCompanion = new IdleCompanionController({ onCompanion: () => stage.showCompanion(1400) });

function syncDemoButton() {
  demoButton.textContent = demo.isRunning ? '暂停演示' : '开始演示';
  demoButton.setAttribute('aria-pressed', String(demo.isRunning));
}

function syncState(state) {
  stage.renderState(state);
  stateLabel.textContent = labels[state];
  for (const button of stateButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.setState === state));
  }
  idleCompanion.syncState(state);
  if (state === 'success' && Math.random() < .35) stage.showCompanion();
}

machine.subscribe(syncState);
syncState(machine.state);

character.addEventListener('click', () => {
  if (!drag.consumeSuppressedClick()) interactions.handleClick();
});
character.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    interactions.handleClick();
  }
});
for (const button of stateButtons) {
  button.addEventListener('click', () => {
    demo.stop();
    syncDemoButton();
    machine.setState(button.dataset.setState);
  });
}
demoButton.addEventListener('click', () => {
  if (demo.isRunning) demo.stop();
  else demo.start();
  syncDemoButton();
});

let blinkTimer = null;
let blinkCloseTimer = null;
function scheduleBlink() {
  blinkTimer = setTimeout(() => {
    if (machine.state === 'idle') {
      stage.setIdleEyes(true);
      blinkCloseTimer = setTimeout(() => stage.setIdleEyes(false), 180);
    }
    scheduleBlink();
  }, 3200 + Math.random() * 2800);
}
scheduleBlink();
demo.start();
syncDemoButton();

window.ceciliaPet = Object.freeze({
  setState(state) { demo.stop(); syncDemoButton(); return machine.setState(state); },
  startDemo() { demo.start(); syncDemoButton(); },
  stopDemo() { demo.stop(); syncDemoButton(); },
  get state() { return machine.state; }
});

function reclampPet() {
  drag.reclamp();
}

window.addEventListener('resize', reclampPet);

window.addEventListener('beforeunload', () => {
  clearTimeout(blinkTimer);
  clearTimeout(blinkCloseTimer);
  demo.stop();
  interactions.dispose();
  window.removeEventListener('resize', reclampPet);
  drag.destroy();
  idleCompanion.dispose();
  stage.dispose();
  machine.dispose();
});
