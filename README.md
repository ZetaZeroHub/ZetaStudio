# Zeta Studio

> **The Reality Lab · Generative Multimodal Intelligence**

Natural language driven 2D/3D game generation. Fusing generative audiovisuals and engine technology to automate high-fidelity immersive interactive experiences.

[中文文档](./README_zh.md)

---

## Overview

**Zeta Studio** is an AI-native multimodal creation suite built by [The Reality Lab](https://zzh.app/). It enables users to describe game ideas in natural language and automatically generates playable 2D and 3D games — complete with rendering, physics, and interactive logic.

The platform combines a visual scene editor, a code editor, and an AI assistant into a unified workspace, lowering the barrier to game creation while maintaining full programmatic control.

## Features

### 🎮 Dual Engine Architecture

- **2D Engine** — Built on [PixiJS](https://pixijs.com/) v8 for high-performance sprite rendering, particle systems, and collision detection
- **3D Engine** — Powered by [Three.js](https://threejs.org/) for immersive 3D scenes with lighting, materials, and camera controls

### 🤖 AI Code Generation

- Describe game mechanics in natural language
- AI assistant generates executable game scripts in real-time
- Live preview with instant feedback loop
- Quick-action buttons for common patterns (add player, add enemy, add scoring)

### 🧩 Built-in Game Templates

| Template | Dimension | Description |
|----------|-----------|-------------|
| Space Shooter | 2D | Classic space shooter with projectile and particle effects |
| Pixel Platformer | 2D | Side-scrolling platformer with collectibles and scoring |
| Quiz Game | 2D | Interactive quiz with score tracking |
| NPC Dialogue | 2D | Visual novel / Galgame-style dialogue system |
| 3D Cube | 3D | Interactive 3D scene with geometry manipulation |
| Solar System | 3D | Animated solar system with orbital mechanics |

### 🎨 Visual Scene Editor

- Drag-and-drop element placement with resize handles
- Real-time property editor (position, size, color, style)
- Scene hierarchy panel with element management
- Edit / Preview mode toggle

### 🌐 Internationalization

- Full Chinese (中文) and English (EN) language support
- One-click language toggle in the navbar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 6 |
| 2D Rendering | PixiJS 8 |
| 3D Rendering | Three.js |
| Code Editor | Monaco Editor |
| State Management | Zustand |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Styling | CSS Modules + CSS Variables |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/ZetaZeroHub/ZetaStudio.git
cd ZetaStudio
npm install
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### Build

```bash
npm run build
```

Production output is in the `dist/` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AiPanel/         # AI assistant chat panel
│   ├── ElementPanel/    # Scene element list
│   ├── GameCanvas/      # 2D/3D rendering canvas
│   ├── Navbar/          # Navigation bar
│   ├── ParticleField/   # Generative particle background
│   ├── PropertyEditor/  # Element property inspector
│   └── ScriptEditor/    # Monaco code editor
├── engine/              # Rendering engines
│   ├── pixiRenderer.js  # PixiJS 2D engine
│   ├── threeRenderer.js # Three.js 3D engine
│   └── behaviorEngine.js# Game logic runtime
├── locales/             # i18n translations (zh/en)
├── pages/               # Route pages
│   ├── HomePage/        # Project gallery + hero
│   └── EditorPage/      # Main editor workspace
├── services/            # API services (LLM integration)
├── stores/              # Zustand state stores
└── templates/           # Game template presets
```

## Design

Zeta Studio follows an **editorial minimalism** design language inspired by Apple, OpenAI, and Anthropic:

- Monochromatic black/white/gray palette
- Sharp geometry with minimal border-radius
- Algorithmic particle field canvas in the hero section
- Restrained animations with `prefers-reduced-motion` support

## License

This project is part of The Reality Lab's multimodal creation suite.

---

**The Reality Lab** — Reshaping the production paradigm of digital content.
