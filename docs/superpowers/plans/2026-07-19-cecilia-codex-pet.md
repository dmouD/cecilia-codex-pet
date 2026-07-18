# Cecilia Codex Pet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained interactive Cecilia pet page for Codex, using a strictly reference-matched master illustration and complete idle, thinking, coding, success, error, click, blink, and sleeping behavior.

**Architecture:** Generate and approve one canonical raster master before any other asset work, then derive every state from that approved master. A small dependency-free ES-module app separates the state machine, interaction/demo controllers, and DOM renderer; the page exposes `window.ceciliaPet.setState()` while remaining usable through manual controls and an automatic demo.

**Tech Stack:** Built-in `image_gen`, PNG alpha post-processing with the installed imagegen helper and Pillow, HTML5, CSS3, vanilla JavaScript ES modules, Node.js built-in test runner, Codex in-app browser for visual QA.

## Global Constraints

- The user-supplied reference pack has explicit roles: the full-body bouquet image governs the complete outfit and leg proportions; the close-up smiling image governs face, hood palette, and simplified line style; the other three new images cross-check cape layers, cream ruffles, under-dress, and hair structure.
- Do not use the earlier brainstorming mockup as a visual reference.
- Preserve the cream outer hood, dark gray-black hood interior and rear hair layer, gray-olive front hair, exact bang grouping and one-sided long-hair silhouette, rounded face, wine-red closed-eye lines, diagonal pink blush, and small open smile.
- The correct full outfit is a dark hooded cape with cream trim/patches over a cream high-neck ruffled blouse and wide sleeves, a dark short dress/skirt layer with pale hem ruffles, dark thigh-high socks, and small dark shoes. Never extend the cream layer into a floor-length robe.
- The master has no bouquet, scarf, snowman, second character, or other scene prop.
- Generate only the master illustration first. Do not generate state variants or integrate the page until the user explicitly approves that master.
- The pink creature is an occasional companion only: success chance, multi-click easter egg, and rare long-idle peek.
- Final runtime assets are local transparent PNG files; no remote images, fonts, scripts, telemetry, or user-data transmission.
- The standalone page does not claim to read private Codex task state. It supports manual control, auto-demo, and the documented `window.ceciliaPet.setState()` bridge.
- Support `prefers-reduced-motion` and keep the character legible at 240–320 px display height.

## File Map

- `assets/references/cecilia-face-style.png` — face, hood palette, and simplified line-style authority.
- `assets/references/cecilia-fullbody-outfit.jpg` — full outfit and leg-proportion authority.
- `assets/references/cecilia-cape-standing.jpg` — standing cape-layer cross-check.
- `assets/references/cecilia-cape-crawl.jpg` — cream blouse/cape opening cross-check.
- `assets/references/cecilia-underdress.jpg` — white blouse, dark under-dress, and hair-structure cross-check.
- `assets/source/cecilia-master-keyed.png` — retained chroma-key master source for reproducible alpha extraction.
- `assets/pet/cecilia-idle.png` — approved canonical master and runtime idle/closed-eye sprite.
- `assets/pet/cecilia-idle-open.png` — brief open-eye blink frame derived from the master.
- `assets/pet/cecilia-thinking.png` — thinking state derived from the master.
- `assets/pet/cecilia-coding.png` — coding state derived from the master.
- `assets/pet/cecilia-success.png` — success state derived from the master.
- `assets/pet/cecilia-error.png` — error state derived from the master.
- `assets/pet/cecilia-sleeping.png` — sleeping state derived from the master.
- `assets/pet/pink-companion.png` — occasional companion derived from the creature in the first reference.
- `package.json` — dependency-free ES-module and test commands.
- `src/pet-state-machine.js` — persistent/transient state rules and inactivity sleep.
- `src/interaction-controller.js` — click, multi-click, and bounded drag behavior.
- `src/demo-controller.js` — automatic state sequence.
- `src/pet-manifest.js` — state-to-asset mapping.
- `src/pet-stage.js` — DOM-only rendering, blink frame, buddy visibility, and asset fallback.
- `src/main.js` — composition root and public API.
- `index.html` — accessible page structure and controls.
- `styles.css` — Codex-dark presentation and state animations.
- `tests/pet-state-machine.test.js` — persistent, transient, invalid, and sleeping rules.
- `tests/interaction-controller.test.js` — click thresholds and coordinate clamping.
- `tests/demo-controller.test.js` — demo sequence and stop behavior.
- `tests/pet-stage.test.js` — manifest rendering and fallback behavior.
- `README.md` — local preview, controls, API, and asset provenance.

---

### Task 1: Produce and approve the strict-reference master illustration

**Files:**
- Create: `assets/references/cecilia-face-style.png`
- Create: `assets/references/cecilia-fullbody-outfit.jpg`
- Create: `assets/references/cecilia-cape-standing.jpg`
- Create: `assets/references/cecilia-cape-crawl.jpg`
- Create: `assets/references/cecilia-underdress.jpg`
- Create: `assets/source/cecilia-master-keyed.png`
- Create: `assets/pet/cecilia-idle.png`

**Interfaces:**
- Consumes: the five new local references listed in Step 1.
- Produces: approved transparent PNG `assets/pet/cecilia-idle.png`; all later image edits must consume this file.

- [ ] **Step 1: Copy the exact new reference pack into the project**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'assets/references','assets/source','assets/pet' | Out-Null
Copy-Item -LiteralPath 'C:\Users\30735\AppData\Local\Temp\codex-clipboard-14982ab0-28c6-47c8-9ee2-9f452af2659b.png' -Destination 'assets/references/cecilia-face-style.png'
Copy-Item -LiteralPath 'C:\Users\30735\AppData\Local\Temp\codex-clipboard-438b62af-e010-41d9-87c7-4438193f9366.jpg' -Destination 'assets/references/cecilia-fullbody-outfit.jpg'
Copy-Item -LiteralPath 'C:\Users\30735\AppData\Local\Temp\codex-clipboard-b136b609-4dd0-4103-8de0-d0ce437bb7c1.jpg' -Destination 'assets/references/cecilia-cape-standing.jpg'
Copy-Item -LiteralPath 'C:\Users\30735\AppData\Local\Temp\codex-clipboard-aa7a2888-8b34-4330-aa7e-e29c8ad9b4b9.jpg' -Destination 'assets/references/cecilia-cape-crawl.jpg'
Copy-Item -LiteralPath 'C:\Users\30735\AppData\Local\Temp\codex-clipboard-a0d2857d-c190-4b99-a6c3-988048b5d478.jpg' -Destination 'assets/references/cecilia-underdress.jpg'
```

Expected: `Get-FileHash assets/references/*` succeeds and every file size is non-zero.

- [ ] **Step 2: Inspect all five project references before generation**

Use the local image viewer on all five files. Record role-specific checklist results for: close-up face/hood/line style; full-body cape, cream blouse and sleeves, dark short skirt layer, pale hem ruffle, dark thigh-high socks and small shoes; standing/crawl cape layers; under-dress and hair structure.

Expected: every listed feature is grounded in at least one designated reference; do not use the HTML brainstorming mockup or the rejected long-robe master as visual input.

- [ ] **Step 3: Generate exactly one full-body keyed master with the built-in image tool**

Use the five references with their designated roles and use this exact prompt:

```text
Use case: stylized-concept
Asset type: canonical full-body raster sprite for a Codex interactive pet
Primary request: Reconstruct Cecilia as one clean full-body 2.5-head chibi standing sprite. This is a high-fidelity synthesis of the supplied references, not a redesign. Correct the previously rejected floor-length cream robe by following the full-body outfit reference exactly.
Input images: Image 1 (face-style) governs the smiling face, hood palette, and simplified hand-drawn line style. Image 2 (fullbody-outfit) governs the complete clothing structure and leg proportions, while excluding its flower bouquet. Image 3 (cape-standing) cross-checks standing cape layers. Image 4 (cape-crawl) cross-checks the cream blouse, wide sleeves, and cape opening. Image 5 (underdress) cross-checks the white/cream blouse, dark short dress/skirt, and hair structure.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for later removal; one uniform color, no floor, gradient, texture, shadow, reflection, or lighting variation.
Subject: Cecilia alone, relaxed front-facing standing pose, arms naturally near the body. Preserve the cream outer hood, dark gray-black hood interior and rear hair layer, gray-olive front hair, the same bang grouping and one-sided long-hair relationship, rounded face, wine-red closed-eye lines, diagonal pink blush, and small open smiling mouth. Her correct outfit is: dark hooded cape with cream trim and pale patches; cream high-neck ruffled blouse and wide sleeves; dark short dress/skirt layer ending above the knees with pale hem ruffles; dark gray-black thigh-high socks; small dark shoes. The cape may hang low behind her, but the cream blouse must not become a floor-length outer robe.
Style/medium: the same soft simplified hand-drawn Japanese chibi style as the face-style reference, slightly wobbly dark outline, flat low-saturation fills, minimal soft shading, simplified facial features.
Composition/framing: full body centered, generous even padding on every side, no cropping, sprite readable at 240–320 px tall.
Color palette: match the references; cream, gray-olive, charcoal-black, pale skin, muted pink blush, restrained wine-red accents only where supported.
Constraints: strict role-based reference fidelity; fully opaque character with crisp separable edges; no #00ff00 anywhere on the subject; no cast or contact shadow; no pink creature in this master; no code board; no text; no watermark.
Avoid: floor-length cream robe, long cream front panels reaching the shoes, altered bangs, symmetrical replacement hairstyle, changed hood color blocking, open eyes in the master, detailed painterly rendering, glossy anime rendering, 3D, realistic anatomy, armor, modern clothing, new jewelry, flower bouquet, scarf, snowman, extra characters, scenery.
```

Expected: one keyed image only. Save/copy the selected output to `assets/source/cecilia-master-keyed.png`; do not generate variants yet.

- [ ] **Step 4: Remove the chroma key with the installed helper**

Run with the bundled Python executable:

```powershell
& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'C:\Users\30735\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py' `
  --input 'assets/source/cecilia-master-keyed.png' `
  --out 'assets/pet/cecilia-idle.png' `
  --auto-key border `
  --soft-matte `
  --transparent-threshold 12 `
  --opaque-threshold 220 `
  --despill
```

Expected: command exits 0 and writes an RGBA PNG.

- [ ] **Step 5: Validate alpha and visible subject coverage**

Run:

```powershell
& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -c "from PIL import Image; p='assets/pet/cecilia-idle.png'; im=Image.open(p); assert 'A' in im.getbands(); a=im.getchannel('A'); assert a.getpixel((0,0))==0 and a.getpixel((im.width-1,im.height-1))==0; bbox=a.getbbox(); assert bbox is not None; coverage=sum(v>0 for v in a.getdata())/(im.width*im.height); assert 0.15 < coverage < 0.85, coverage; print(im.size, im.mode, round(coverage,3), bbox)"
```

Expected: prints dimensions, `RGBA`, coverage between `0.15` and `0.85`, and a non-empty bounding box. If green fringe is visible, rerun Step 4 once with `--edge-contract 1`; if hair is damaged or fringe remains, stop and ask before any native-transparency fallback.

- [ ] **Step 6: Perform the strict visual checklist and present the master to the user**

Inspect `assets/pet/cecilia-idle.png` at original resolution and at 280 px display height. Check each item independently:

```text
[ ] cream outer hood shape matches reference
[ ] black hood interior/rear layer partition matches reference
[ ] gray-olive bang grouping matches reference
[ ] one-sided long-hair length relationship matches reference
[ ] rounded face proportions match reference
[ ] wine-red closed-eye lines, diagonal blush, and small open smile match reference
[ ] line weight/wobble and flat low-saturation coloring match reference
[ ] dark cape with cream trim/patches matches the full-body references
[ ] cream high-neck blouse and wide ruffled sleeves remain separate from the skirt
[ ] dark short dress/skirt and pale hem ruffle are visible above the knees
[ ] dark thigh-high socks and small dark shoes match the full-body reference
[ ] there is no floor-length cream robe, bouquet, scarf, snowman, or second character
[ ] alpha edge has no green fringe or missing hair chunks
```

Expected: show the master image to the user and stop. Do not start Task 2 until the user explicitly approves it.

- [ ] **Step 7: Commit only after user approval**

Run:

```powershell
$gitExe = 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
& $gitExe add -- assets/references assets/source/cecilia-master-keyed.png assets/pet/cecilia-idle.png
& $gitExe -c user.name='Codex' -c user.email='codex@local' commit -m "art: add approved Cecilia master sprite"
& $gitExe status --short
```

Expected: commit succeeds and `git status --short` is clean.

---

### Task 2: Derive every state and companion asset from the approved master

**Files:**
- Create: `assets/pet/cecilia-idle-open.png`
- Create: `assets/pet/cecilia-thinking.png`
- Create: `assets/pet/cecilia-coding.png`
- Create: `assets/pet/cecilia-success.png`
- Create: `assets/pet/cecilia-error.png`
- Create: `assets/pet/cecilia-sleeping.png`
- Create: `assets/pet/pink-companion.png`
- Create: keyed intermediates under `assets/source/`

**Interfaces:**
- Consumes: user-approved `assets/pet/cecilia-idle.png` and the role-based five-image pack under `assets/references/`.
- Produces: runtime RGBA assets named exactly as listed; `src/pet-manifest.js` in Task 5 relies on these paths.

- [ ] **Step 1: Inspect both the approved master and original reference before editing**

Use the local image viewer on both paths. Treat the master as the edit target and the original image as a supporting fidelity reference.

Expected: both images are visible before the first edit call.

- [ ] **Step 2: Generate the open-eye blink frame as a minimal edit**

Use this exact edit instruction, with a flat `#00ff00` removable background:

```text
Use case: precise-object-edit
Asset type: blink frame for a Codex pet sprite
Primary request: Change only the eyes from the approved closed smile to a brief softly opened expression. Keep the exact same character, pose, silhouette, crop, face, mouth, blush, hair strands, hood partitions, clothing, line weight, colors, and proportions.
Input images: Image 1 is the approved master edit target; supporting reference images retain their Task 1 roles for face/line style, full outfit, cape layers, under-dress, and hair cross-checks.
Constraints: change only the eyes; flat uniform #00ff00 background; no shadow, text, watermark, pink creature, or new prop.
```

Save keyed output as `assets/source/cecilia-idle-open-keyed.png`, remove the key with the Task 1 helper command, and write `assets/pet/cecilia-idle-open.png`.

- [ ] **Step 3: Generate the thinking, coding, success, error, and sleeping edits one at a time**

Use the same invariant prefix for every call:

```text
Use case: precise-object-edit
Asset type: state sprite for a Codex interactive pet
Input images: Image 1 is the user-approved master edit target; supporting reference images retain their Task 1 roles for face/line style, full outfit, cape layers, under-dress, and hair cross-checks.
Invariants: preserve the exact character identity, face proportions, bang grouping, one-sided hair-length relationship, cream/black hood partition, clothing construction, outline style, palette, body scale, canvas size, and padding. Do not redesign any feature. Use a perfectly flat uniform #00ff00 removable background with no shadow, floor, gradient, text, or watermark.
```

Append exactly one state request per separate generation:

```text
THINKING: Change only the pose to a gentle head tilt with one finger near the lips; keep the reference-style closed smiling eyes. No prop.
CODING: Change only the arms to hold a small plain charcoal code board and make a subtle tapping gesture; the board may show two tiny pale code-like strokes but no readable text or logo.
SUCCESS: Change only the pose to a small joyful hop with hands raised; keep the character alone so the companion can be layered separately.
ERROR: Change only the expression and posture to slightly teary closed eyes, lowered hood posture, and a small charcoal board with one simple red X symbol; no words.
SLEEPING: Change only the pose to a compact seated curl with peaceful closed eyes and hands tucked into the wide sleeves; preserve all costume shapes and colors.
```

Save to matching keyed names under `assets/source/`, then remove each key to the corresponding `assets/pet/*.png` path.

Expected: five separate images; no call combines multiple states into a sprite sheet.

- [ ] **Step 4: Generate the pink companion as its own layer**

Use the original reference plus this prompt:

```text
Use case: stylized-concept
Asset type: occasional companion layer for a Codex pet
Primary request: Isolate and reconstruct only the small round muted-pink creature held by Cecilia in the original reference, matching its simple white oval eyes, tiny mouth, dark wine-red top marking, soft hand-drawn outline, and low-saturation fill.
Input images: Image 1 is `assets/references/cecilia-face-style.png` and is the sole visual reference for the creature.
Composition/framing: creature alone, centered with generous padding, no Cecilia body parts.
Scene/backdrop: perfectly flat uniform #00ff00 removable background, no floor, shadow, gradient, or texture.
Constraints: preserve its simple reference appearance; no redesign, limbs only if already implied by the reference; no text or watermark.
```

Save keyed and transparent results as `assets/source/pink-companion-keyed.png` and `assets/pet/pink-companion.png`.

- [ ] **Step 5: Validate every transparent asset mechanically and visually**

Run the Task 1 alpha command for every file in `assets/pet/*.png`. Inspect all state files side-by-side at 280 px height and reject any change in face width, bang grouping, hair length relationship, hood partition, sleeve construction, outline weight, or palette.

Expected: all files are RGBA, corners transparent, subject coverage plausible, and identity invariants unchanged.

- [ ] **Step 6: Commit the approved state asset set**

Run:

```powershell
$gitExe = 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
& $gitExe add -- assets/source assets/pet
& $gitExe -c user.name='Codex' -c user.email='codex@local' commit -m "art: add Cecilia pet state sprites"
```

Expected: one commit containing only generated/processed art assets.

---

### Task 3: Implement the tested pet state machine

**Files:**
- Create: `package.json`
- Create: `tests/pet-state-machine.test.js`
- Create: `src/pet-state-machine.js`

**Interfaces:**
- Consumes: injected `setTimer`, `clearTimer`, and logger functions.
- Produces: `PERSISTENT_STATES`, `PetStateMachine`, `setState(state): boolean`, `playTransient('clicked'): boolean`, `finishTransient()`, `noteActivity()`, `subscribe(listener)`, and `dispose()`.

- [ ] **Step 1: Add the dependency-free Node test configuration**

Create `package.json`:

```json
{
  "name": "cecilia-codex-pet",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.js",
    "serve": "python -m http.server 4173"
  }
}
```

- [ ] **Step 2: Write the failing state-machine tests**

Create `tests/pet-state-machine.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { PetStateMachine } from '../src/pet-state-machine.js';

function harness() {
  let pending = null;
  const warnings = [];
  const machine = new PetStateMachine({
    sleepAfterMs: 120000,
    setTimer(fn) { pending = fn; return 1; },
    clearTimer() { pending = null; },
    logger: { warn(message) { warnings.push(message); } }
  });
  return { machine, warnings, runTimer() { const fn = pending; pending = null; fn?.(); } };
}

test('accepts persistent states and rejects unknown values without changing state', () => {
  const { machine, warnings } = harness();
  assert.equal(machine.setState('coding'), true);
  assert.equal(machine.state, 'coding');
  assert.equal(machine.setState('unknown'), false);
  assert.equal(machine.setState('unknown'), false);
  assert.equal(machine.state, 'coding');
  assert.equal(warnings.length, 1);
});

test('clicked is transient and restores the previous persistent state', () => {
  const { machine } = harness();
  machine.setState('thinking');
  assert.equal(machine.playTransient('clicked'), true);
  assert.equal(machine.state, 'clicked');
  machine.finishTransient();
  assert.equal(machine.state, 'thinking');
});

test('idle sleeps after inactivity and activity wakes back to idle', () => {
  const { machine, runTimer } = harness();
  runTimer();
  assert.equal(machine.state, 'sleeping');
  machine.noteActivity();
  assert.equal(machine.state, 'idle');
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/pet-state-machine.js`.

- [ ] **Step 4: Implement the minimal state machine**

Create `src/pet-state-machine.js`:

```js
export const PERSISTENT_STATES = Object.freeze([
  'idle', 'thinking', 'coding', 'success', 'error', 'sleeping'
]);

const VALID = new Set(PERSISTENT_STATES);

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
    if (!VALID.has(next)) {
      const key = String(next);
      if (!this.warnedStates.has(key)) {
        this.warnedStates.add(key);
        this.logger.warn(`Ignored unknown Cecilia pet state: ${key}`);
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

  emit() {
    for (const listener of this.listeners) listener(this.state);
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

  dispose() {
    this.cancelSleep();
    this.listeners.clear();
  }
}
```

- [ ] **Step 5: Run the state-machine tests**

Run: `& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test`

Expected: 4 tests pass, 0 fail.

- [ ] **Step 6: Commit the state machine**

```powershell
$gitExe = 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
& $gitExe add -- package.json src/pet-state-machine.js tests/pet-state-machine.test.js
& $gitExe -c user.name='Codex' -c user.email='codex@local' commit -m "feat: add Cecilia pet state machine"
```

---

### Task 4: Implement interaction and automatic demo controllers with tests

**Files:**
- Create: `tests/interaction-controller.test.js`
- Create: `tests/demo-controller.test.js`
- Create: `src/interaction-controller.js`
- Create: `src/demo-controller.js`

**Interfaces:**
- Consumes: `PetStateMachine` methods `noteActivity()`, `playTransient()`, `finishTransient()`, and `setState()`.
- Produces: `InteractionController.handleClick(now)`, `clampPosition(...)`, `DemoController.start()`, `stop()`, and `isRunning`.

- [ ] **Step 1: Write the failing controller tests**

Create `tests/interaction-controller.test.js`:

```js
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

test('clampPosition keeps the dragged pet inside its stage', () => {
  assert.deepEqual(
    clampPosition({ x: 500, y: -20 }, { width: 320, height: 420 }, { width: 160, height: 280 }, 8),
    { x: 152, y: 8 }
  );
});
```

Create `tests/demo-controller.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test`

Expected: FAIL with missing controller modules.

- [ ] **Step 3: Implement click handling and drag clamping**

Create `src/interaction-controller.js`:

```js
export function clampPosition(point, bounds, pet, padding = 8) {
  return {
    x: Math.min(Math.max(point.x, padding), bounds.width - pet.width - padding),
    y: Math.min(Math.max(point.y, padding), bounds.height - pet.height - padding)
  };
}

export class InteractionController {
  constructor({
    machine,
    onCompanion,
    clickWindowMs = 900,
    transientMs = 650,
    setTimer = globalThis.setTimeout.bind(globalThis),
    clearTimer = globalThis.clearTimeout.bind(globalThis)
  }) {
    this.machine = machine;
    this.onCompanion = onCompanion;
    this.clickWindowMs = clickWindowMs;
    this.transientMs = transientMs;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.clicks = [];
    this.transientTimer = null;
  }

  handleClick(now = Date.now()) {
    this.machine.noteActivity();
    this.machine.playTransient('clicked');
    this.clicks = this.clicks.filter(time => now - time <= this.clickWindowMs);
    this.clicks.push(now);
    if (this.clicks.length >= 3) {
      this.clicks = [];
      this.onCompanion();
    }
    if (this.transientTimer !== null) this.clearTimer(this.transientTimer);
    this.transientTimer = this.setTimer(() => {
      this.transientTimer = null;
      this.machine.finishTransient();
    }, this.transientMs);
  }

  dispose() {
    if (this.transientTimer !== null) this.clearTimer(this.transientTimer);
    this.transientTimer = null;
  }
}
```

- [ ] **Step 4: Implement the demo controller**

Create `src/demo-controller.js`:

```js
export class DemoController {
  constructor({
    setState,
    sequence = ['thinking', 'coding', 'success', 'idle', 'error', 'idle'],
    intervalMs = 4000,
    setTimer = globalThis.setTimeout.bind(globalThis),
    clearTimer = globalThis.clearTimeout.bind(globalThis)
  }) {
    this.setState = setState;
    this.sequence = sequence;
    this.intervalMs = intervalMs;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.index = 0;
    this.timer = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.schedule();
  }

  schedule() {
    this.timer = this.setTimer(() => {
      if (!this.isRunning) return;
      this.setState(this.sequence[this.index]);
      this.index = (this.index + 1) % this.sequence.length;
      this.schedule();
    }, this.intervalMs);
  }

  stop() {
    this.isRunning = false;
    if (this.timer !== null) this.clearTimer(this.timer);
    this.timer = null;
  }
}
```

- [ ] **Step 5: Run all controller tests**

Run: `& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test`

Expected: 7 tests pass, 0 fail.

- [ ] **Step 6: Commit controllers**

```powershell
$gitExe = 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
& $gitExe add -- src/interaction-controller.js src/demo-controller.js tests/interaction-controller.test.js tests/demo-controller.test.js
& $gitExe -c user.name='Codex' -c user.email='codex@local' commit -m "feat: add pet interactions and demo cycle"
```

---

### Task 5: Implement the manifest and tested DOM renderer

**Files:**
- Create: `src/pet-manifest.js`
- Create: `src/pet-stage.js`
- Create: `tests/pet-stage.test.js`

**Interfaces:**
- Consumes: exact asset paths from Task 2 and a root exposing `[data-pet-image]` and `[data-companion]`.
- Produces: `PET_ASSETS`, `PetStage.renderState(state)`, `setIdleEyes(open)`, `showCompanion(durationMs)`, and `dispose()`.

- [ ] **Step 1: Write the failing renderer test**

Create `tests/pet-stage.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { PetStage } from '../src/pet-stage.js';

function fakeRoot() {
  const image = { src: '', alt: '', dataset: {}, onerror: null };
  const buddy = { hidden: true, classList: { add() {}, remove() {} } };
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

test('renderer maps states and falls back to the approved master', () => {
  const root = fakeRoot();
  const stage = new PetStage(root, { idle: '/idle.png', thinking: '/thinking.png', clicked: '/idle.png' });
  stage.renderState('thinking');
  assert.equal(root.image.src, '/thinking.png');
  assert.equal(root.dataset.state, 'thinking');
  root.image.onerror();
  assert.equal(root.image.src, '/idle.png');
});

test('open-eye frame is used only while idle', () => {
  const root = fakeRoot();
  const stage = new PetStage(root, { idle: '/idle.png', idleOpen: '/open.png', clicked: '/idle.png' });
  stage.renderState('idle');
  stage.setIdleEyes(true);
  assert.equal(root.image.src, '/open.png');
  stage.renderState('clicked');
  stage.setIdleEyes(true);
  assert.equal(root.image.src, '/idle.png');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test`

Expected: FAIL with missing `src/pet-stage.js`.

- [ ] **Step 3: Create the exact asset manifest**

Create `src/pet-manifest.js`:

```js
export const PET_ASSETS = Object.freeze({
  idle: './assets/pet/cecilia-idle.png',
  idleOpen: './assets/pet/cecilia-idle-open.png',
  thinking: './assets/pet/cecilia-thinking.png',
  coding: './assets/pet/cecilia-coding.png',
  success: './assets/pet/cecilia-success.png',
  error: './assets/pet/cecilia-error.png',
  sleeping: './assets/pet/cecilia-sleeping.png',
  clicked: './assets/pet/cecilia-idle.png',
  companion: './assets/pet/pink-companion.png'
});
```

- [ ] **Step 4: Implement the DOM renderer**

Create `src/pet-stage.js`:

```js
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
    this.image.dataset.fallback = 'false';
    this.image.src = this.assets[state] ?? this.assets.idle;
    this.image.alt = `塞西莉亚宠物：${state}`;
  }

  setIdleEyes(open) {
    if (this.state !== 'idle') return;
    this.image.src = open ? this.assets.idleOpen : this.assets.idle;
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
}
```

- [ ] **Step 5: Run renderer tests**

Run: `& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test`

Expected: 9 tests pass, 0 fail.

- [ ] **Step 6: Commit renderer and manifest**

```powershell
$gitExe = 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
& $gitExe add -- src/pet-manifest.js src/pet-stage.js tests/pet-stage.test.js
& $gitExe -c user.name='Codex' -c user.email='codex@local' commit -m "feat: render Cecilia pet state assets"
```

---

### Task 6: Assemble the accessible Codex pet page

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `src/main.js`
- Modify: `src/interaction-controller.js`
- Modify: `tests/interaction-controller.test.js`

**Interfaces:**
- Consumes: all modules from Tasks 3–5 and exact DOM hooks declared below.
- Produces: `window.ceciliaPet.setState(state)`, `startDemo()`, `stopDemo()`, and an interactive draggable page.

- [ ] **Step 1: Add a failing drag-controller behavior test**

Append to `tests/interaction-controller.test.js`:

```js
import { createDragController } from '../src/interaction-controller.js';

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
```

Run: `& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test`

Expected: FAIL because `createDragController` is not exported.

- [ ] **Step 2: Implement bounded drag behavior**

Append to `src/interaction-controller.js`:

```js
export function createDragController(element, { padding = 8 } = {}) {
  let active = null;
  let position = { x: padding, y: padding };
  let suppressClick = false;

  function pointerDown(event) {
    active = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: position };
    element.setPointerCapture?.(event.pointerId);
  }

  function pointerMove(event) {
    if (!active || active.id !== event.pointerId) return;
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    if (Math.hypot(dx, dy) > 6) suppressClick = true;
    const bounds = element.parentElement.getBoundingClientRect();
    const pet = element.getBoundingClientRect();
    position = clampPosition({ x: active.origin.x + dx, y: active.origin.y + dy }, bounds, pet, padding);
    element.style.setProperty('--pet-x', `${position.x}px`);
    element.style.setProperty('--pet-y', `${position.y}px`);
  }

  function pointerUp(event) {
    if (active?.id === event.pointerId) active = null;
  }

  element.addEventListener('pointerdown', pointerDown);
  element.addEventListener('pointermove', pointerMove);
  element.addEventListener('pointerup', pointerUp);
  element.addEventListener('pointercancel', pointerUp);

  return {
    consumeSuppressedClick() {
      const value = suppressClick;
      suppressClick = false;
      return value;
    },
    destroy() {
      element.removeEventListener('pointerdown', pointerDown);
      element.removeEventListener('pointermove', pointerMove);
      element.removeEventListener('pointerup', pointerUp);
      element.removeEventListener('pointercancel', pointerUp);
    }
  };
}
```

Run: `& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test`

Expected: 10 tests pass, 0 fail.

- [ ] **Step 3: Create the semantic HTML structure**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>塞西莉亚 · Codex 宠物</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <main class="pet-app">
    <header class="pet-header">
      <div><p class="eyebrow">CODEX COMPANION</p><h1>塞西莉亚</h1></div>
      <button id="demo-toggle" class="quiet-button" type="button" aria-pressed="true">暂停演示</button>
    </header>
    <section id="pet-stage" class="pet-stage" data-state="idle" aria-live="polite">
      <div id="pet-character" class="pet-character" role="button" tabindex="0" aria-label="点击塞西莉亚进行互动">
        <img data-pet-image src="./assets/pet/cecilia-idle.png" alt="塞西莉亚宠物：idle" draggable="false">
      </div>
      <img data-companion class="companion" src="./assets/pet/pink-companion.png" alt="粉色团子" hidden>
      <div class="particles" aria-hidden="true"><i></i><i></i><i></i></div>
      <p id="state-label" class="state-label">待机</p>
    </section>
    <nav class="state-controls" aria-label="宠物状态">
      <button type="button" data-set-state="idle"><span class="control-icon" aria-hidden="true">○</span><span class="control-label">待机</span></button>
      <button type="button" data-set-state="thinking"><span class="control-icon" aria-hidden="true">?</span><span class="control-label">思考</span></button>
      <button type="button" data-set-state="coding"><span class="control-icon" aria-hidden="true">&lt;/&gt;</span><span class="control-label">写代码</span></button>
      <button type="button" data-set-state="success"><span class="control-icon" aria-hidden="true">✓</span><span class="control-label">完成</span></button>
      <button type="button" data-set-state="error"><span class="control-icon" aria-hidden="true">×</span><span class="control-label">报错</span></button>
      <button type="button" data-set-state="sleeping"><span class="control-icon" aria-hidden="true">☾</span><span class="control-label">睡觉</span></button>
    </nav>
    <p class="hint">点击她会回应；连续点击三次会叫来粉色团子。也可以拖动她。</p>
  </main>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create the complete Codex-dark styling and motion rules**

Create `styles.css` with these required selectors and behaviors:

```css
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,"Microsoft YaHei",sans-serif;background:#111318;color:#f4efe5}
*{box-sizing:border-box}body{margin:0;min-width:280px;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 50% 12%,#332d3a 0,#171920 46%,#101217 100%)}
button{font:inherit}.pet-app{width:min(100%,520px);padding:22px}.pet-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.eyebrow{margin:0;color:#c9ae77;font-size:11px;letter-spacing:.18em}.pet-header h1{margin:3px 0 0;font-size:24px}.quiet-button,.state-controls button{border:1px solid #4a4650;color:#e8dfd1;background:#24242b;border-radius:999px;padding:8px 12px;cursor:pointer}.quiet-button:hover,.state-controls button:hover,.state-controls button[aria-pressed="true"]{border-color:#d8bd82;background:#332e2d}
.pet-stage{position:relative;height:min(68vh,470px);min-height:360px;overflow:hidden;border:1px solid rgba(231,216,186,.14);border-radius:26px;background:radial-gradient(circle at 50% 35%,rgba(241,225,190,.14),transparent 42%),linear-gradient(160deg,rgba(255,255,255,.035),rgba(0,0,0,.08));box-shadow:0 22px 65px rgba(0,0,0,.28)}
.pet-character{--pet-x:8px;--pet-y:8px;position:absolute;left:0;top:0;width:min(68%,300px);height:calc(100% - 16px);transform:translate(var(--pet-x),var(--pet-y));touch-action:none;cursor:grab;user-select:none;display:flex;align-items:flex-end;justify-content:center}.pet-character:active{cursor:grabbing}.pet-character:focus-visible{outline:2px solid #e5c887;outline-offset:-4px;border-radius:20px}.pet-character img{display:block;max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 16px 18px rgba(0,0,0,.28));transform-origin:50% 88%;animation:breath 3.4s ease-in-out infinite}
.pet-stage[data-state="thinking"] .pet-character img{animation:ponder 2.2s ease-in-out infinite}.pet-stage[data-state="coding"] .pet-character img{animation:type 480ms ease-in-out infinite}.pet-stage[data-state="success"] .pet-character img{animation:celebrate 720ms cubic-bezier(.2,.8,.2,1)}.pet-stage[data-state="error"] .pet-character img{animation:error-shiver 1.8s ease-in-out infinite}.pet-stage[data-state="clicked"] .pet-character img{animation:clicked 620ms cubic-bezier(.2,.9,.3,1)}.pet-stage[data-state="sleeping"] .pet-character img{animation:sleep 4.2s ease-in-out infinite}
.companion{position:absolute;right:8%;bottom:8%;width:26%;max-width:112px;opacity:0;transform:translateY(30px) scale(.8);transition:opacity .2s ease,transform .35s cubic-bezier(.2,.8,.2,1)}.companion.is-visible{opacity:1;transform:translateY(0) scale(1);animation:buddy-bob 1.2s ease-in-out infinite}.particles i{position:absolute;width:9px;height:9px;background:#ead081;clip-path:polygon(50% 0,61% 38%,100% 50%,61% 62%,50% 100%,39% 62%,0 50%,39% 38%);opacity:0}.pet-stage[data-state="success"] .particles i{animation:spark 1s ease-out forwards}.pet-stage[data-state="thinking"] .particles i{animation:float-glow 2.4s ease-in-out infinite}.particles i:nth-child(1){left:24%;top:28%}.particles i:nth-child(2){right:22%;top:22%;animation-delay:.12s!important}.particles i:nth-child(3){right:16%;top:48%;animation-delay:.22s!important}
.state-label{position:absolute;right:16px;top:12px;margin:0;padding:6px 10px;border-radius:999px;background:rgba(17,19,24,.72);color:#d8c7a7;font-size:12px}.state-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.state-controls button{display:flex;gap:6px;align-items:center;justify-content:center}.control-icon{color:#dfc687;font-weight:700}.hint{margin:12px 4px 0;color:#aaa4ad;font-size:12px;text-align:center}
@keyframes breath{50%{transform:translateY(-4px) scaleY(1.012)}}@keyframes ponder{50%{transform:translate(-3px,-3px) rotate(-1.5deg)}}@keyframes type{50%{transform:translateY(-2px) rotate(.4deg);filter:drop-shadow(0 16px 18px rgba(0,0,0,.28)) drop-shadow(0 0 5px rgba(230,205,145,.24))}}@keyframes celebrate{45%{transform:translateY(-26px) scale(1.03)}70%{transform:translateY(2px) scale(.98)}}@keyframes error-shiver{20%,24%{transform:translateX(-2px)}22%,26%{transform:translateX(2px)}}@keyframes clicked{35%{transform:translateY(-14px) rotate(-2deg)}70%{transform:translateY(0) rotate(1deg)}}@keyframes sleep{50%{transform:translateY(3px) scale(.99)}}@keyframes buddy-bob{50%{transform:translateY(-5px) scale(1.02)}}@keyframes spark{0%{opacity:0;transform:scale(.2)}45%{opacity:1;transform:scale(1.5) rotate(45deg)}100%{opacity:0;transform:translateY(-22px) scale(.6) rotate(90deg)}}@keyframes float-glow{0%,100%{opacity:.15;transform:translateY(5px) scale(.7)}50%{opacity:.8;transform:translateY(-8px) scale(1)}}
@media(max-width:420px){.pet-app{padding:12px}.pet-stage{min-height:330px}.state-controls{grid-template-columns:repeat(2,1fr)}.hint{display:none}}@media(max-width:340px){.control-label{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.state-controls button{min-height:38px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}.companion{transition:opacity .01ms linear}}
```

- [ ] **Step 5: Compose the runtime and public API**

Create `src/main.js`:

```js
import { PetStateMachine } from './pet-state-machine.js';
import { InteractionController, createDragController } from './interaction-controller.js';
import { DemoController } from './demo-controller.js';
import { PET_ASSETS } from './pet-manifest.js';
import { PetStage } from './pet-stage.js';

const labels = { idle:'待机', thinking:'思考中', coding:'写代码', success:'完成', error:'报错', sleeping:'睡觉', clicked:'回应' };
const root = document.querySelector('#pet-stage');
const character = document.querySelector('#pet-character');
const stateLabel = document.querySelector('#state-label');
const demoButton = document.querySelector('#demo-toggle');
const machine = new PetStateMachine();
const stage = new PetStage(root, PET_ASSETS);
const demo = new DemoController({ setState: state => machine.setState(state) });
const interactions = new InteractionController({ machine, onCompanion: () => stage.showCompanion() });
const drag = createDragController(character);

function syncDemoButton() {
  demoButton.textContent = demo.isRunning ? '暂停演示' : '开始演示';
  demoButton.setAttribute('aria-pressed', String(demo.isRunning));
}

machine.subscribe(state => {
  stage.renderState(state);
  stateLabel.textContent = labels[state];
  for (const button of document.querySelectorAll('[data-set-state]')) {
    button.setAttribute('aria-pressed', String(button.dataset.setState === state));
  }
  if (state === 'success' && Math.random() < .35) stage.showCompanion();
});
stage.renderState(machine.state);

character.addEventListener('click', () => {
  if (!drag.consumeSuppressedClick()) interactions.handleClick();
});
character.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); interactions.handleClick(); }
});
for (const button of document.querySelectorAll('[data-set-state]')) {
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
let companionPeekTimer = null;
function scheduleBlink() {
  blinkTimer = setTimeout(() => {
    if (machine.state === 'idle') {
      stage.setIdleEyes(true);
      setTimeout(() => stage.setIdleEyes(false), 180);
    }
    scheduleBlink();
  }, 3200 + Math.random() * 2800);
}
scheduleBlink();

function scheduleCompanionPeek() {
  companionPeekTimer = setTimeout(() => {
    if (machine.state === 'idle' && Math.random() < .15) stage.showCompanion(1400);
    scheduleCompanionPeek();
  }, 45000);
}
scheduleCompanionPeek();
demo.start();

window.ceciliaPet = Object.freeze({
  setState(state) { demo.stop(); syncDemoButton(); return machine.setState(state); },
  startDemo() { demo.start(); syncDemoButton(); },
  stopDemo() { demo.stop(); syncDemoButton(); },
  get state() { return machine.state; }
});

window.addEventListener('beforeunload', () => {
  clearTimeout(blinkTimer);
  clearTimeout(companionPeekTimer);
  demo.stop();
  interactions.dispose();
  drag.destroy();
  stage.dispose();
  machine.dispose();
});
```

- [ ] **Step 6: Run the full unit suite and commit the page**

Run: `& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test`

Expected: 10 tests pass, 0 fail.

Commit:

```powershell
$gitExe = 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
& $gitExe add -- index.html styles.css src/main.js src/interaction-controller.js tests/interaction-controller.test.js
& $gitExe -c user.name='Codex' -c user.email='codex@local' commit -m "feat: assemble interactive Cecilia Codex pet"
```

---

### Task 7: Verify the complete page and document use

**Files:**
- Create: `README.md`
- Modify if verification reveals a scoped defect: files from Tasks 3–6 and their matching tests.

**Interfaces:**
- Consumes: finished local app and all runtime assets.
- Produces: verified user-facing page and concise usage documentation.

- [ ] **Step 1: Write usage and provenance documentation**

Create `README.md` with these exact sections:

````markdown
# 塞西莉亚 Codex 宠物

一个离线、自包含的 Codex 互动宠物页面。角色素材严格基于项目内的第一张用户参考图制作。

## 运行

```powershell
& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 4173
```

打开 `http://localhost:4173/`。

## 互动

- 单击塞西莉亚：短暂回应。
- 连续单击三次：召唤粉色团子彩蛋。
- 拖动塞西莉亚：在舞台内调整位置。
- 状态按钮：待机、思考、写代码、完成、报错、睡觉。
- 演示按钮：自动轮播主要工作状态。

## 状态接口

```js
window.ceciliaPet.setState('coding');
window.ceciliaPet.startDemo();
window.ceciliaPet.stopDemo();
```

独立页面不会读取 Codex 的私有任务状态；外部状态桥可调用上述接口。

## 素材

运行时素材位于 `assets/pet/`。`assets/references/` 保存用户提供并按角色分工使用的五张人物参考；`assets/source/` 保留键控源图以便复现去背处理。素材不向外部服务发送。
````

- [ ] **Step 2: Run automated verification**

Run:

```powershell
& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test
$gitExe = 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
& $gitExe diff --check
```

Expected: 10 tests pass, 0 fail; `git diff --check` emits no errors.

- [ ] **Step 3: Start a local server and inspect in the Codex in-app browser**

Run `& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 4173` in a persistent terminal. Open `http://localhost:4173/` in the user-selected in-app browser.

Verify with DOM snapshots and focused interaction checks:

```text
[ ] page title and six state controls are visible
[ ] manual state buttons update data-state and visible sprite
[ ] single click enters clicked and restores the prior work state
[ ] triple click shows and then hides the pink companion
[ ] demo advances through thinking, coding, success, idle, error, idle
[ ] dragging stays within stage bounds and does not also click
[ ] missing state image falls back to cecilia-idle.png
[ ] keyboard Enter/Space activates character interaction
[ ] no console errors or failed remote requests
```

- [ ] **Step 4: Perform responsive and reduced-motion visual QA**

Inspect at widths 320 px, 420 px, and 520 px. Temporarily emulate `prefers-reduced-motion: reduce` and confirm looping transforms/particles stop. Compare the character at 280 px height against the original reference for the final fidelity check.

Expected: no clipping, overlap, green fringe, identity drift, unreadable controls, or large looping motion under reduced-motion mode.

- [ ] **Step 5: Commit documentation and any test-backed verification fixes**

Run:

```powershell
$gitExe = 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
& $gitExe add -- README.md
& $gitExe -c user.name='Codex' -c user.email='codex@local' commit -m "docs: explain Cecilia pet controls and state API"
& $gitExe status --short
```

Expected: final status is clean. If a verification fix changed implementation, commit its test and implementation together before the documentation commit.

- [ ] **Step 6: Final completion check**

Run fresh:

```powershell
& 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test
$gitExe = 'C:\Users\30735\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
& $gitExe log --oneline --max-count=8
& $gitExe status --short
```

Expected: all tests pass, the asset/code/docs commits are present, and the working tree is clean. Deliver the local URL, saved asset paths, final generation prompts, and the main file links to the user.
