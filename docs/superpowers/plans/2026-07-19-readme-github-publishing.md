# Cecilia README and GitHub Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `dmouD/cecilia-codex-pet` as a public GitHub repository with a detailed, portable README for ordinary users and developers.

**Architecture:** Keep the existing static pet runtime unchanged. Add an executable README contract test, replace the root README with one progressive Chinese guide, then publish the existing `master` baseline and `feature/cecilia-codex-pet` branch before opening a draft pull request through the GitHub connector.

**Tech Stack:** Markdown, Node.js built-in test runner, ES modules, Git, GitHub CLI, GitHub connector.

## Global Constraints

- Modify documentation and documentation tests only; do not change runtime visuals, state behavior, or public API behavior.
- The README is Simplified Chinese first and preserves JavaScript identifiers and English state values.
- The public API remains `window.ceciliaPet.setState(state)`, `startDemo()`, `stopDemo()`, and read-only `state`.
- Valid persistent states are exactly `idle`, `thinking`, `coding`, `success`, `error`, and `sleeping`; `clicked` remains internal and transient.
- README commands and links must not contain local absolute paths.
- Create public repository `dmouD/cecilia-codex-pet` without adding an automatic license, README, or `.gitignore`.
- Open a draft pull request from `feature/cecilia-codex-pet` to `master`.

---

### Task 1: Detailed README and executable documentation contract

**Files:**
- Create: `tests/readme-contract.test.js`
- Modify: `README.md`

**Interfaces:**
- Consumes: the existing `window.ceciliaPet` API from `src/main.js` and state values from `src/pet-state-machine.js`.
- Produces: a portable root README and a Node test that detects drift in required headings, API names, state names, commands, paths, privacy, and rights wording.

- [ ] **Step 1: Create the failing README contract test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('README contains the progressive user and developer guide', () => {
  for (const heading of [
    '## 功能特性',
    '## 快速开始',
    '## 操作教程',
    '## 状态参考',
    '## JavaScript API',
    '## 接入 Codex 或其他任务系统',
    '## 素材与定制',
    '## 常见问题',
    '## 隐私与版权'
  ]) {
    assert.match(readme, new RegExp(heading));
  }
});

test('README documents the complete public API and state contract', () => {
  for (const api of ['window.ceciliaPet', 'setState(state)', 'startDemo()', 'stopDemo()', 'state']) {
    assert.ok(readme.includes(api), `missing API documentation: ${api}`);
  }
  for (const state of ['idle', 'thinking', 'coding', 'success', 'error', 'sleeping', 'clicked']) {
    assert.ok(readme.includes(`\`${state}\``), `missing state documentation: ${state}`);
  }
  assert.match(readme, /成功返回 `true`/);
  assert.match(readme, /未知状态返回 `false`/);
});

test('README is portable and documents validation, fallback, privacy, and rights', () => {
  assert.doesNotMatch(readme, /[A-Za-z]:[\\/]+Users[\\/]/);
  assert.match(readme, /assets\/pet\/cecilia-idle\.png/);
  assert.match(readme, /npm run serve/);
  assert.match(readme, /npm test/);
  assert.match(readme, /回退到 `cecilia-idle\.png`/);
  assert.match(readme, /不会读取 Codex 的私有任务、账号、聊天内容或剪贴板/);
  assert.match(readme, /不附带开源许可证/);
});
```

- [ ] **Step 2: Run the focused test and verify the current README fails the new contract**

Run:

```powershell
node --test tests/readme-contract.test.js
```

Expected: FAIL because the current README does not contain the full heading set and detailed contract text.

- [ ] **Step 3: Replace `README.md` with the approved progressive guide**

````markdown
# 塞西莉亚 · Codex 宠物

![塞西莉亚宠物待机状态](./assets/pet/cecilia-idle.png)

一个离线、自包含、可由 JavaScript 状态接口驱动的塞西莉亚桌面宠物页面。角色造型严格依据项目内经用户确认的参考图制作，适合直接体验，也可以接入 Codex 或其他任务系统作为可视化状态伙伴。

> 本项目不会自动读取 Codex 的私有任务、账号、聊天内容或剪贴板。外部任务状态必须由你自己的桥接代码显式传入。

## 功能特性

- 六种持久状态：待机、思考、写代码、完成、报错、睡觉。
- 单击回应、三击召唤粉色团子、舞台内拖动和键盘操作。
- 自动状态演示、随机眨眼、自动休眠和偶发伙伴事件。
- 响应式布局、减少动态效果支持、图片加载失败回退。
- 零运行时依赖；页面不会向外部服务上传素材或任务数据。
- 通过 `window.ceciliaPet` 接口接入 Codex、脚本或其他任务系统。

## 快速开始

### 环境要求

- Python 3：用于启动本地静态服务器。
- Node.js 18 或更高版本：仅在运行自动化测试时需要。
- Git：仅在克隆仓库时需要。

### 获取并运行

```bash
git clone https://github.com/dmouD/cecilia-codex-pet.git
cd cecilia-codex-pet
npm run serve
```

打开 <http://localhost:4173/>。

`npm run serve` 实际执行 `python -m http.server 4173`。如果系统中的 Python 命令名称不同，可以直接使用以下命令之一：

```powershell
# Windows Python Launcher
py -m http.server 4173
```

```bash
# macOS / Linux
python3 -m http.server 4173
```

不要直接双击 `index.html`：页面使用 ES modules，部分浏览器会限制 `file://` 页面加载模块。

## 操作教程

| 操作 | 效果 |
| --- | --- |
| 单击塞西莉亚 | 短暂进入 `clicked` 回应状态，约 650ms 后恢复原状态 |
| 900ms 内连续单击三次 | 召唤粉色团子 |
| 拖动塞西莉亚 | 在舞台边界内调整位置，拖动结束不会误触发单击 |
| 聚焦角色后按 Enter 或 Space | 等同于单击，方便键盘操作 |
| 点击六个状态按钮 | 停止自动演示并切换到对应持久状态 |
| 点击“开始演示/暂停演示” | 启动或暂停自动状态轮播 |

页面加载后自动开始演示。手动点击状态按钮或调用 `setState(state)` 会停止演示。

## 状态参考

| 状态 | 类型 | 用途 |
| --- | --- | --- |
| `idle` | 持久 | 空闲、等待输入；会随机眨眼，持续两分钟后自动睡觉 |
| `thinking` | 持久 | 分析问题、规划步骤或等待推理结果 |
| `coding` | 持久 | 编写代码、执行命令或处理文件 |
| `success` | 持久 | 任务成功；有 35% 概率同时出现粉色团子 |
| `error` | 持久 | 命令失败、任务异常或需要用户处理 |
| `sleeping` | 持久 | 长时间无活动后的睡眠状态 |
| `clicked` | 临时 | 用户点击后的短暂回应；不能通过公开 `setState` 设置 |

自动演示每 4 秒按以下顺序循环：`thinking` → `coding` → `success` → `idle` → `error` → `idle`。

塞西莉亚处于 `idle` 时，每 45 秒有 15% 概率出现一次粉色团子。连续三击会直接触发伙伴事件。

## JavaScript API

页面模块加载完成后，会在 `window` 上创建冻结的只读对象：

```js
window.ceciliaPet
```

### API 总览

| 成员 | 签名 | 返回值 | 说明 |
| --- | --- | --- | --- |
| 设置状态 | `setState(state)` | `boolean` | 停止演示并设置持久状态；成功返回 `true`，未知状态返回 `false` |
| 开始演示 | `startDemo()` | `undefined` | 启动自动轮播；重复调用不会建立多个计时器 |
| 停止演示 | `stopDemo()` | `undefined` | 停止轮播并保留当前状态 |
| 当前状态 | `state` | `string` | 只读 getter，返回当前可见状态，包括短暂的 `clicked` |

### `setState(state)`

```js
const changed = window.ceciliaPet.setState('coding');
console.log(changed); // true
console.log(window.ceciliaPet.state); // "coding"
```

参数 `state` 必须是六种持久状态之一。调用时会先停止自动演示，再清除临时状态并切换角色图片。成功返回 `true`；未知状态返回 `false`，页面保持原状态，并在控制台对同一未知值最多警告一次。

```js
window.ceciliaPet.setState('unknown'); // false
```

`clicked` 是内部交互状态：

```js
window.ceciliaPet.setState('clicked'); // false
```

### `startDemo()`

```js
window.ceciliaPet.startDemo();
```

启动自动状态轮播并同步演示按钮。方法没有参数，返回 `undefined`。如果演示已经运行，重复调用不会创建第二套轮播计时器。

### `stopDemo()`

```js
window.ceciliaPet.stopDemo();
```

停止自动状态轮播，保留停止时的状态，并同步演示按钮。方法没有参数，返回 `undefined`。

### `state`

```js
const currentState = window.ceciliaPet.state;
```

这是只读 getter。普通情况下返回六种持久状态之一；单击反馈期间可能短暂返回 `clicked`。

## 接入 Codex 或其他任务系统

先建立任务状态到宠物状态的映射：

```js
const petStateByTaskState = {
  waiting: 'idle',
  planning: 'thinking',
  running: 'coding',
  succeeded: 'success',
  failed: 'error',
  inactive: 'sleeping'
};

export function syncCeciliaPet(taskState) {
  const pet = window.ceciliaPet;
  const nextState = petStateByTaskState[taskState];
  if (!pet || !nextState) return false;
  return pet.setState(nextState);
}
```

任务系统产生状态变化时显式调用桥接函数：

```js
syncCeciliaPet('planning');
syncCeciliaPet('running');
syncCeciliaPet('succeeded');
```

如果脚本可能早于页面模块执行，请等待全局接口出现：

```js
window.addEventListener('load', () => {
  if (window.ceciliaPet) {
    window.ceciliaPet.setState('idle');
  }
});
```

当前项目只提供浏览器端状态接口，不包含读取 Codex 内部事件的后台服务。接入真实 Codex 状态时，应由你控制的扩展、脚本或本地桥接层调用上述 API。

## 素材与定制

运行时素材位于 `assets/pet/`：

| 文件 | 用途 |
| --- | --- |
| `cecilia-idle.png` | 待机母版和默认回退图 |
| `cecilia-idle-open.png` | 待机眨眼帧 |
| `cecilia-thinking.png` | 思考状态 |
| `cecilia-coding.png` | 写代码状态 |
| `cecilia-success.png` | 完成状态 |
| `cecilia-error.png` | 报错状态 |
| `cecilia-sleeping.png` | 睡觉状态 |
| `pink-companion.png` | 粉色团子伙伴 |

直接替换同名 PNG 即可更换画面，建议保持透明背景和接近原图的画布比例。素材路径在 `src/pet-manifest.js` 中集中声明。

如果某张状态图缺失或加载失败，页面会回退到 `cecilia-idle.png`。`assets/source/` 保存键控源图，`assets/references/` 保存用户提供的创作参考；两者都不是运行时依赖。

如需增加新状态，需要同步修改：

1. `src/pet-manifest.js` 中的素材映射。
2. `src/pet-state-machine.js` 中的持久状态集合。
3. `src/main.js` 中的中文标签。
4. `index.html` 中的状态按钮。
5. 对应自动化测试和本 README。

## 测试

```bash
npm test
```

测试使用 Node.js 内置测试运行器，不需要安装第三方包。语法检查可以运行：

```powershell
Get-ChildItem src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## 项目结构

```text
.
├─ assets/
│  ├─ pet/          # 浏览器运行时素材
│  ├─ source/       # 键控源图
│  └─ references/   # 创作参考图
├─ src/             # 状态机、交互、演示和渲染逻辑
├─ tests/           # Node.js 自动化测试
├─ index.html       # 页面结构
├─ styles.css       # 页面样式与响应式规则
└─ README.md        # 使用和接口文档
```

## 常见问题

### 为什么双击 `index.html` 后页面不工作？

浏览器可能禁止 `file://` 页面加载 ES modules。请使用 `npm run serve` 或任一 Python 静态服务器命令。

### 4173 端口被占用怎么办？

换一个端口，例如：

```bash
python -m http.server 8080
```

然后打开 <http://localhost:8080/>。

### 调用 `setState` 返回 `false` 是什么原因？

传入值不在六种持久状态中。检查大小写，并确认没有把内部状态 `clicked` 作为参数。

### 为什么状态图显示成待机图？

目标素材不存在或加载失败时会自动回退。检查 `assets/pet/` 中的文件名是否与 `src/pet-manifest.js` 完全一致。

### 如何恢复自动轮播？

点击页面上的“开始演示”，或运行：

```js
window.ceciliaPet.startDemo();
```

## 隐私与版权

页面完全在本地浏览器中运行，不会主动读取或上传 Codex 任务、账号、聊天内容、剪贴板或本地文件。只有调用者显式传入的状态值会影响宠物。

角色名称、原作元素和参考图片的权利归各自权利人。本仓库中的角色素材依据用户提供并确认的参考图制作，仅用于学习、个人展示和技术演示。

本仓库不附带开源许可证。公开可见不等于授权复制、再发布或商业使用；如需使用代码或素材，请先确认适用权利并取得必要许可。
````

- [ ] **Step 4: Run the focused test and verify the new README contract passes**

Run:

```powershell
node --test tests/readme-contract.test.js
```

Expected: 3 tests pass, 0 fail.

- [ ] **Step 5: Run the complete local validation suite**

Run:

```powershell
npm test
Get-ChildItem src -Filter *.js | ForEach-Object { node --check $_.FullName }
git diff --check
```

Expected: all Node tests pass, every syntax check exits 0, and `git diff --check` prints no errors.

- [ ] **Step 6: Commit only the README and its contract test**

```powershell
git add -- README.md tests/readme-contract.test.js
git commit -m "docs: expand Cecilia API and usage guide"
```

Expected: one commit containing exactly the two intended files; `git status -sb` is clean.

---

### Task 2: Public GitHub repository and draft pull request

**Files:**
- No repository files are created or modified.

**Interfaces:**
- Consumes: clean local branches `master` and `feature/cecilia-codex-pet`, authenticated GitHub account `dmouD`, and Task 1's documentation commit.
- Produces: public repository `dmouD/cecilia-codex-pet`, tracked `origin`, both branches on GitHub, and a draft pull request targeting `master`.

- [ ] **Step 1: Re-run publishing preflight checks**

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' auth status
git status -sb
git remote -v
git branch --show-current
```

Expected: authenticated as `dmouD`, clean branch `feature/cecilia-codex-pet`, and no existing `origin` remote.

- [ ] **Step 2: Create the empty public GitHub repository**

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' repo create dmouD/cecilia-codex-pet --public --description "Interactive Cecilia companion for Codex with state API and offline assets"
```

Expected: GitHub returns `https://github.com/dmouD/cecilia-codex-pet`; the repository contains no generated files.

- [ ] **Step 3: Add the remote and push the baseline first**

```powershell
git remote add origin https://github.com/dmouD/cecilia-codex-pet.git
git push -u origin master:master
& 'C:\Program Files\GitHub CLI\gh.exe' repo edit dmouD/cecilia-codex-pet --default-branch master
```

Expected: remote `master` exists and is the default branch.

- [ ] **Step 4: Push the completed feature branch**

```powershell
git push -u origin feature/cecilia-codex-pet
```

Expected: GitHub reports the branch was created and local tracking is configured.

- [ ] **Step 5: Open the draft pull request through the GitHub connector**

Call `mcp__codex_apps__github_create_pull_request` with:

```json
{
  "repository_full_name": "dmouD/cecilia-codex-pet",
  "base": "master",
  "head": "feature/cecilia-codex-pet",
  "draft": true,
  "maintainer_can_modify": true,
  "title": "Add interactive Cecilia Codex pet",
  "body": "## What changed\n\n- Added the approved Cecilia full-body pet assets and six persistent visual states.\n- Added click, triple-click companion, drag, keyboard, sleep, blink, and demo interactions.\n- Added the `window.ceciliaPet` state API and a detailed Chinese user/developer guide.\n- Added offline asset fallback, responsive behavior, reduced-motion support, and automated tests.\n\n## Why\n\nThis provides a faithful Cecilia companion that can visualize Codex or external task state without reading private task data.\n\n## User impact\n\nUsers can run the pet locally, interact with it directly, or connect task events through a documented JavaScript API.\n\n## Validation\n\n- `npm test`\n- `node --check` for every `src/*.js` file\n- `git diff --check`\n- Manual browser QA for all states, click/triple-click, keyboard, drag, fallback, and responsive layouts"
}
```

Expected: one draft pull request from `feature/cecilia-codex-pet` to `master`.

- [ ] **Step 6: Verify the public repository and pull request**

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' repo view dmouD/cecilia-codex-pet --json nameWithOwner,visibility,defaultBranchRef,url
& 'C:\Program Files\GitHub CLI\gh.exe' pr view --repo dmouD/cecilia-codex-pet --json number,title,isDraft,baseRefName,headRefName,url
git status -sb
git remote -v
```

Expected: repository visibility is `PUBLIC`, default branch is `master`, the PR is draft with the intended base/head, and the local working tree is clean.
