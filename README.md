# 塞西莉亚 Codex 宠物

一个离线、自包含的 Codex 互动宠物页面。角色素材在批准前按项目内五张角色分工参考图还原；用户于 2026-07-19 明确批准后，`assets/pet/cecilia-idle.png` 是所有运行时状态的唯一视觉基线。

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
