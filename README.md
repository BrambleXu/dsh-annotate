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

<p align="center">English | <a href="README.zh.md">中文</a></p>

Visual browser feedback for DeepSeek Harness. `/annotate` asks the companion Chrome extension to enter selection mode; each selected element contributes a selector, DOM facts, computed style highlights, accessibility data, a comment, and an optional viewport screenshot to the agent's next turn.

## Why this exists 💡

Browser UI problems are difficult to describe precisely through plain text. `dsh-annotate` lets you point at the relevant element and send the Agent the surrounding browser facts, so visual feedback stays attached to the page element instead of becoming a vague description or a copied screenshot.

## Features ✨

- Select elements directly in Chrome or Chromium through `/annotate`.
- Capture selectors, DOM facts, computed-style highlights, accessibility data, comments, and optional viewport screenshots.
- Send structured annotations to the Agent through a local loopback WebSocket bridge.
- Restrict browser connections by loopback host, extension origin, and optional extension ID.

## Install 📦

Add the plugin project to a Harness profile:

```sh
dsh plugin --profile demo add ./dsh-annotate
```

Then install the companion extension:

1. Open `chrome://extensions` in Chrome or Chromium.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this project's `browser-extension` directory.
4. Open the extension popup and keep the default bridge endpoint.

For tighter local authorization, copy the extension ID shown in the popup into `allowedExtensionId` in a later Harness patch layer.

## Use 🚀

```text
/annotate
/annotate http://localhost:3000
```

Click an element, enter its comment, and repeat as needed. **Submit** sends all captured facts and the visible-tab screenshot to the agent. **Escape** cancels.

## Configure ⚙️

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

The server refuses non-loopback hosts and browser connections whose origin is not `chrome-extension://`. An empty `allowedExtensionId` accepts any locally installed Chrome extension; set the exact ID for stricter isolation.

## Develop 🧑‍💻

```sh
pnpm install
pnpm run check
```

Commit the generated `lib/` files with source changes so Git installs include the declared package entry before build scripts run.

Reload the unpacked browser extension after editing its files.

## Scope 🎯

Version 0.1 targets one local Chrome/Chromium browser, one active tab, and visible-viewport screenshots. Remote browsers, full-page capture, edit recording, and inline draggable note cards are deferred.

## License 📄

MIT

## Credits 🙏

The interaction is inspired by [`pi-annotate`](https://github.com/nicobailon/pi-annotate). This implementation is built around Harness's human-command, attachment, and Agent APIs and uses a small loopback WebSocket bridge instead of a native-messaging host.
