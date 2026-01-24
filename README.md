<div align="center">
  <img src="https://antiraid.xyz/logo.webp" height="150px" width="150px" alt="AntiRaid Logo"/>
  <h1>Badgerfang</h1>
  <p><strong>The next-generation, high-performance dashboard for AntiRaid.</strong></p>

  <p>
    <a href="https://github.com/Anti-Raid/badgerfang-next/stargazers"><img src="https://img.shields.io/github/stars/Anti-Raid/badgerfang-next?style=for-the-badge&color=5865F2" alt="Stars"/></a>
    <a href="https://github.com/Anti-Raid/badgerfang-next/network/members"><img src="https://img.shields.io/github/forks/Anti-Raid/badgerfang-next?style=for-the-badge&color=5865F2" alt="Forks"/></a>

  </p>
</div>

---

## 🚀 Overview

**Badgerfang** is the official rewrite of the [AntiRaid Website](https://github.com/Anti-Raid/website), rebuilt from the ground up using **Tanstack Start** and **React 19**. It provides a sleek, modern, and lightning-fast experience for managing your Discord server's security and automation.

## ✨ Key Features

- 🛡️ **Advanced Anti-Raid**: Intelligent detection and real-time threat analysis.
- ⚡ **Lightning Performance**: Built with Next.js and React 19 for instantaneous response times.
- 📜 **Dual-Language Scripting**: Extend your server's functionality with **Luau** and **JavaScript**.
- 🛠️ **Visual Workflows**: Manage complex automation using our **Holographic HUD** Flow UI.
- 📊 **Smart Analytics**: Deep insights into server activity, growth, and security events.

## 🛠️ Tech Stack

- **Framework**: [Tanstack Start)](https://tanstack.com/start/latest)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Runtime**: [Bun](https://bun.sh/)
- **Visuals**: [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/), [Recharts](https://recharts.org/)
- **Workflow UI**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Observability**: [OpenTelemetry](https://opentelemetry.io/)

## 📦 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- Node.js (<= 22) if not using Bun for everything.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Anti-Raid/badgerfang-next.git
   cd badgerfang-next
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Configure environment variables:

   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

4. Run the development server:

   ```bash
   bun run dev
   ```

### WebAssembly Assets

Badgerfang uses WebAssembly for high-performance settings middleware (e.g., templating). While pre-compiled assets are included in `public/wasm/`, you can recompile them if you have the [Emscripten SDK](https://emscripten.org/) and Rust installed:

```bash
cd wasm
make release
make copy
```

## 🤝 Contributing

We welcome contributions! If you encounter any issues or have suggestions, please:

1. Check the existing [Issues](https://github.com/Anti-Raid/badgerfang-next/issues).
2. Report new bugs or feature requests on our [Discord Server](https://discord.gg/rCtD9RqWJf).
3. Submit a Pull Request with your improvements.

## 📜 Credits & Attributions

- **React Flow**: Powering the Anti-Raid Flow UI.
- **Purrquinox Devs**: Maintained by the Purrquinox team.

---

<div align="center">
  <p>Made with ❤️ by the AntiRaid Team</p>
  <a href="https://github.com/Anti-Raid/badgerfang-next/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=Anti-Raid/badgerfang-next" />
  </a>
</div>
