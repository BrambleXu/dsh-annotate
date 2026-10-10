# dsh-annotate

![dsh-annotate hero](assets/hero.png)

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/BrambleXu/dsh-annotate?style=flat-square" alt="MIT license"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%5E22.19%20%7C%20%3E%3D24-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js ^22.19 or >=24"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.9"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/tests-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Tests with Vitest"></a>
</p>

<p align="center">
  <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin#development--runtime"><img src="https://img.shields.io/static/v1?label=awesome%20%C2%B7%20DSH%20plugin&amp;message=development&amp;color=5B4CF0&amp;style=flat-square" alt="awesome · DSH plugin · development"></a>
</p>

<p align="center"><a href="README.md">English</a> | 中文</p>

为 DeepSeek Harness 提供浏览器视觉反馈。`/annotate` 会让配套的 Chrome 扩展进入选择模式；每个被选中的元素都会为 Agent 的下一轮对话提供选择器、DOM 信息、计算样式高亮、可访问性数据、评论，以及可选的视口截图。

## 为什么存在 💡

浏览器界面问题很难通过纯文本准确描述。`dsh-annotate` 让你直接指向相关元素，并将周围的浏览器信息发送给 Agent，使视觉反馈与页面元素保持关联，而不是变成模糊的描述或一张脱离上下文的截图。

## 功能 ✨

- 通过 `/annotate` 在 Chrome 或 Chromium 中直接选择元素。
- 捕获选择器、DOM 信息、计算样式高亮、可访问性数据、评论和可选的视口截图。
- 通过本地 loopback WebSocket bridge 将结构化批注发送给 Agent。
- 支持按 loopback 主机、扩展来源和可选扩展 ID 限制浏览器连接。

## 安装 📦

将插件项目添加到 Harness profile：

```sh
dsh plugin --profile demo add ./dsh-annotate
```

然后安装配套扩展：

1. 在 Chrome 或 Chromium 中打开 `chrome://extensions`。
2. 启用**开发者模式**。
3. 选择**加载已解压的扩展程序**，并选中本项目的 `browser-extension` 目录。
4. 打开扩展弹窗，并保留默认的 bridge endpoint。

如需更严格的本地授权，可以将弹窗中显示的扩展 ID 复制到后续 Harness patch layer 的 `allowedExtensionId` 配置中。

## 使用 🚀

```text
/annotate
/annotate http://localhost:3000
```

点击元素，输入评论，按需重复操作。点击**提交**会将所有已捕获的信息和当前可见标签页的截图发送给 Agent。按 **Escape** 取消。

## 配置 ⚙️

```yaml
- id: dsh-annotate
  name: dsh-annotate
  config:
    host: 127.0.0.1
    port: 43119
    allowedExtensionId: abcdefghijklmnopqrstuvwxyzabcdef
    requestTimeoutMs: 300000
    maxPayloadBytes: 16777216
    includeScreenshot: true
```

服务器会拒绝非 loopback 主机，以及来源不是 `chrome-extension://` 的浏览器连接。`allowedExtensionId` 为空时，接受任意本地安装的 Chrome 扩展；如需更严格的隔离，请设置准确的扩展 ID。

## 开发 🧑‍💻

```sh
pnpm install
pnpm run check
```

修改源码后，将生成的 `lib/` 文件一起提交，确保 Git 安装在执行构建脚本之前就包含声明的包入口。

修改扩展文件后，请重新加载已解压的浏览器扩展。

## 范围 🎯

0.1 版本面向一台本地 Chrome/Chromium 浏览器、一个活动标签页和可见视口截图。远程浏览器、整页截图、编辑记录和可拖拽的行内批注卡片暂不支持。

## 许可证 📄

MIT

## 致谢 🙏

交互方式受到 [`pi-annotate`](https://github.com/nicobailon/pi-annotate) 的启发。本实现围绕 Harness 的 human-command、attachment 和 Agent API 构建，并使用小型 loopback WebSocket bridge 代替 native-messaging host。
