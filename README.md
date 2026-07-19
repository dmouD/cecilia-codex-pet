# 塞西莉亚 · Codex 宠物

![塞西莉亚宠物待机状态](./assets/pet/cecilia-idle.png)

一个离线、自包含、可由 JavaScript 状态接口驱动的塞西莉亚桌面宠物页面。适合直接体验，也可以接入 Codex 或其他任务系统作为可视化状态伙伴。

> 本项目不会读取 Codex 的私人任务、账号、聊天内容或剪贴板。外部任务状态必须由你自己的桥接代码显式传入。

## 功能特色

- 六种持久状态：待机、思考、写代码、完成、报错、睡觉；另有短暂的点击回应。
- 支持单击、三击召唤粉色团子、舞台内拖动和键盘操作。
- 自动状态演示、随机眨眼、自动休眠和偶发伙伴事件。
- 响应式布局、减少动态效果支持，以及图片加载失败回退。
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

打开 <http://localhost:4173/>。`npm run serve` 实际执行 `python -m http.server 4173`；Windows 可用 `py -m http.server 4173`，macOS/Linux 可用 `python3 -m http.server 4173`。

不要直接双击 `index.html`：页面使用 ES modules，部分浏览器会限制 `file://` 页面加载模块。

## 操作教程

| 操作 | 效果 |
| --- | --- |
| 单击塞西莉亚 | 短暂进入 `clicked` 回应状态，约 650ms 后恢复原状态 |
| 900ms 内连续单击三次 | 召唤粉色团子 |
| 拖动塞西莉亚 | 在舞台边界内调整位置，结束时不会误触发单击 |
| 聚焦角色后按 Enter 或 Space | 等同单击，方便键盘操作 |
| 点击六个状态按钮 | 停止自动演示并切换到对应持久状态 |
| 点击“开始演示/暂停演示” | 启动或暂停自动状态轮播 |

页面加载后自动开始演示。手动点击状态按钮或调用 `setState(state)` 会停止演示。

## 状态参考

| 状态 | 类型 | 用途 |
| --- | --- | --- |
| `idle` | 持久 | 空闲、等待输入；随机眨眼，持续两分钟后自动睡觉 |
| `thinking` | 持久 | 分析问题、规划步骤或等待推理结果 |
| `coding` | 持久 | 编写代码、执行命令或处理文件 |
| `success` | 持久 | 任务成功；有 35% 概率同时出现粉色团子 |
| `error` | 持久 | 命令失败、任务异常或需要用户处理 |
| `sleeping` | 持久 | 长时间无活动后的睡眠状态 |
| `clicked` | 临时 | 用户点击后的短暂回应；不能通过公开 `setState` 设置 |

自动演示每 4 秒循环：`thinking` → `coding` → `success` → `idle` → `error` → `idle`。`idle` 时每 45 秒有 15% 概率出现伙伴事件。

## JavaScript API

页面模块加载完成后，会在 `window` 上创建冻结的只读对象：

```js
window.ceciliaPet
```

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

参数必须是六种持久状态之一。调用会停止演示、清除临时状态并切换角色图片。成功返回 `true`；未知状态返回 `false`，页面保持原状态，并在控制台对同一未知值最多警告一次；`clicked` 是内部交互状态，`window.ceciliaPet.setState('clicked')` 也返回 `false`。

### `startDemo()`

```js
window.ceciliaPet.startDemo();
```

启动自动状态轮播并同步演示按钮；无参数，返回 `undefined`，重复调用不会创建第二套计时器。

### `stopDemo()`

```js
window.ceciliaPet.stopDemo();
```

停止自动状态轮播、保留停止时的状态并同步演示按钮；无参数，返回 `undefined`。

### `state`

```js
const currentState = window.ceciliaPet.state;
```

这是只读 getter。通常返回六种持久状态之一；单击反馈期间可能短暂返回 `clicked`。

## 接入 Codex 或其他任务系统

先建立任务状态到宠物状态的映射：

```js
const petStateByTaskState = {
  waiting: 'idle', planning: 'thinking', running: 'coding',
  succeeded: 'success', failed: 'error', inactive: 'sleeping'
};

export function syncCeciliaPet(taskState) {
  const pet = window.ceciliaPet;
  const nextState = petStateByTaskState[taskState];
  if (!pet || !nextState) return false;
  return pet.setState(nextState);
}
```

在任务状态改变时显式调用 `syncCeciliaPet('planning')`、`syncCeciliaPet('running')` 或 `syncCeciliaPet('succeeded')`。如脚本可能早于页面模块执行，请在 `load` 后确认 `window.ceciliaPet` 存在。

项目只提供浏览器端状态接口，不包含读取 Codex 内部事件的后端服务；真实接入应由你控制的扩展、脚本或本地桥接层调用上述 API。

## 素材与定制

运行时素材位于 `assets/pet/`：`cecilia-idle.png`、`cecilia-idle-open.png`、`cecilia-thinking.png`、`cecilia-coding.png`、`cecilia-success.png`、`cecilia-error.png`、`cecilia-sleeping.png` 和 `pink-companion.png`。素材路径在 `src/pet-manifest.js` 集中声明。

直接替换同名 PNG 即可更换画面，建议保留透明背景和接近原图的画布比例。如果状态图缺失或加载失败，页面会回退到 `cecilia-idle.png`。`assets/source/` 保存键控源图，`assets/references/` 保存用户提供的创作参考；两者均非运行时依赖。

增加新状态时，请同步更新 `src/pet-manifest.js` 的映射、`src/pet-state-machine.js` 的持久状态集合、`src/main.js` 的中文标签、`index.html` 的状态按钮、自动化测试和本 README。

## 项目结构

```text
.
├── assets/
│   ├── pet/          # 浏览器运行时素材
│   ├── source/       # 键控源图
│   └── references/   # 创作参考图
├── src/              # 状态机、交互、演示和渲染逻辑
├── tests/            # Node.js 自动化测试
├── index.html        # 页面结构
├── styles.css        # 页面样式与响应式规则
└── README.md         # 使用和接口文档
```

## 测试

```bash
npm test
```

测试使用 Node.js 内置测试运行器，无需安装第三方包。语法检查：

```powershell
Get-ChildItem src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## 常见问题

### 为什么双击 `index.html` 后页面不工作？

浏览器可能禁止 `file://` 页面加载 ES modules。请使用 `npm run serve` 或任一 Python 静态服务器命令。

### 4173 端口被占用怎么办？

运行 `python -m http.server 8080`，然后打开 <http://localhost:8080/>。

### 调用 `setState` 返回 `false` 是什么原因？

传入值不在六种持久状态中；检查大小写，并确认没有把内部状态 `clicked` 作为参数。

### 为什么状态图显示成待机图？

目标素材不存在或加载失败时会自动回退。检查 `assets/pet/` 中的文件名是否与 `src/pet-manifest.js` 完全一致。

### 如何恢复自动轮播？

点击“开始演示”，或运行 `window.ceciliaPet.startDemo()`。

## 隐私与版权

页面完全在本地浏览器中运行，不会主动读取或上传 Codex 任务、账号、聊天内容、剪贴板或本地文件。只有调用者显式传入的状态值会影响宠物。

角色名称、原作元素和参考图片的权利归各自权利人。本仓库中的角色素材依据用户提供并确认的参考图制作，仅用于学习、个人展示和技术演示。

本仓库不附带开源许可证。公开可见不等于授权复制、再发布或商业使用；如需使用代码或素材，请先确认适用权利并取得必要许可。
