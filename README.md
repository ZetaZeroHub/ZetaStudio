# Zeta Studio

> **The Reality Lab · Generative Multimodal Intelligence**

Natural language driven 2D/3D game generation. Fusing generative audiovisuals and engine technology to automate high-fidelity immersive interactive experiences.

[中文文档](./README_zh.md)

---

## Overview

**Zeta Studio** is an AI-native multimodal creation suite built by [The Reality Lab](https://zzh.app/). It enables users to describe game ideas in natural language and automatically generates playable 2D and 3D games — complete with rendering, physics, and interactive logic.

The platform combines a visual scene editor, a code editor, and an AI assistant into a unified workspace, lowering the barrier to game creation while maintaining full programmatic control.

## Screenshots

### Homepage

![Homepage — Hero section with particle canvas and feature highlights](./docs/screenshots/homepage.png)

### Feature Showcase

![Core feature cards — 2D Engine, 3D Space, AI Assistant](./docs/screenshots/homepage_features.png)

### Template Selection — 2D Games

![2D game template selection — Space Shooter, Pixel Platformer, Quiz, etc.](./docs/screenshots/template_2d.png)

### Template Selection — 3D Games

![3D game template selection — Cube, Solar System, FPS Shooter](./docs/screenshots/template_3d.png)

### 2D Editor

![2D game editor — scene canvas, code editor, AI assistant tri-pane layout](./docs/screenshots/editor_2d.png)

### 3D Editor — Advanced Lighting

![3D editor — Spot light property panel, shadow config, Three.js canvas](./docs/screenshots/editor_3d_lighting.png)

### 3D Editor — Shortcuts Guide

![3D editor — Controls help overlay, transform gizmo, material properties](./docs/screenshots/editor_3d_shortcuts.png)

---

## Features

### 🎮 Dual Engine Architecture

- **2D Engine** — Built on [PixiJS](https://pixijs.com/) v8 for high-performance sprite rendering, particle systems, and collision detection
- **3D Engine** — Powered by [Three.js](https://threejs.org/) for immersive 3D scenes with PBR materials and real-time shadows

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
| 3D FPS Shooter | 3D | First-person shooter with pointer lock and scoring |

### 🎨 Visual Scene Editor

- Drag-and-drop element placement with resize handles
- Real-time property editor (position, size, color, style)
- Scene hierarchy panel with element management
- Edit / Preview mode toggle
- 3D editor controls guide panel (G/R/S transform, X/Y/Z axis constraints, 1/3/7 camera views)

### 💡 Advanced 3D Lighting System

| Light Type | Features |
|-----------|----------|
| Ambient Light | Uniform global illumination, color + intensity |
| Directional Light | Directional lighting + PCFSoft shadow mapping + shadow precision/bias/bounds config + target coordinates |
| Point Light | Radial illumination + distance decay + optional shadows |
| Spot Light ✨ | Cone lighting + angle/penumbra/decay + shadows + target coordinates |
| Hemisphere Light ✨ | Sky color + ground color dual-tone illumination |

- **PBR Materials** — MeshStandardMaterial with metalness and roughness controls
- **Real-time Shadows** — PCFSoftShadowMap + ACES Filmic tone mapping
- **Script-controllable** — All lighting properties accessible via `elements['light_id']` in scripts

### 🌌 Skybox / Environment Mapping

- **Solid Color Mode** — Custom background color
- **Panorama Mode** — Upload equirectangular panorama images as environment maps
- Supports `.jpg`, `.png`, `.hdr`, `.webp` formats
- Panorama automatically applied as `scene.background` + `scene.environment` (PBR environment reflections)

### 📦 3D Asset Library

- 12+ built-in open-source 3D models (vehicles, animals, buildings, etc.)
- Import `.glb/.gltf/.obj` format models
- Auto-normalized scaling + scene integration

### 🖼️ 2D Sprite Library

- 20+ built-in sprite assets (characters, items, terrain, etc.)
- Local image upload support (stored in localStorage)
- Async image loading with automatic placeholder replacement

### 🌐 Internationalization & Responsive Design

- Full Chinese (中文) and English (EN) language support
- One-click language toggle in the navbar
- Mobile and tablet adaptive layouts

### 🔗 Three-Way Binding Architecture

All features follow a "Script Code · Visual Panel · AI Assistant" triple-binding design:

1. **Script Editable** — Monaco code editor for full JavaScript programming
2. **Panel Visual** — Left-side property panels display and modify all element properties in real-time
3. **AI Adjustable** — Right-side AI assistant dynamically generates/modifies code via natural language

### 🎬 Multi-Scene Management

- **Independent Scenes** — Each scene has its own element list, scripts, and background settings
- **Scene Selector** — Horizontal card-style scene switcher at top of Scene tab, with add/delete controls
- **Scene Backgrounds** — Per-scene customizable backgrounds (color picker / local image upload)
- **Script Scene Navigation** — Preview mode scripts can call `switchScene(sceneId)` for scene transitions
- **Runtime API** — `getCurrentSceneId()` / `getSceneList()` for querying scene info
- **Backward Compatible** — Legacy projects auto-migrate to single-scene format with zero data loss

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 6 |
| 2D Rendering | PixiJS 8 |
| 3D Rendering | Three.js (WebGLRenderer + PCFSoftShadowMap) |
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
│   ├── ElementPanel/    # Scene element list + asset library
│   ├── GameCanvas/      # 2D/3D rendering canvas
│   ├── Navbar/          # Navigation bar
│   ├── ParticleField/   # Generative particle background
│   ├── PropertyEditor/  # Element property inspector (with light/skybox panels)
│   └── ScriptEditor/    # Monaco code editor
├── data/                # Asset library definitions
│   └── assetLibrary.js  # 3D models + 2D sprite presets
├── engine/              # Rendering engines
│   ├── pixiRenderer.js  # PixiJS 2D engine
│   ├── threeRenderer.js # Three.js 3D engine (advanced lighting/skybox)
│   └── behaviorEngine.js# Game logic runtime
├── locales/             # i18n translations (zh/en)
├── pages/               # Route pages
│   ├── HomePage/        # Project gallery + hero
│   └── EditorPage/      # Main editor workspace
├── services/            # API services (LLM integration)
├── stores/              # Zustand state stores
└── templates/           # Game template presets (incl. FPS shooter)
```

## Design

Zeta Studio follows an **editorial minimalism** design language inspired by Apple, OpenAI, and Anthropic:

- Monochromatic black/white/gray palette
- Sharp geometry with minimal border-radius
- Algorithmic particle field canvas in the hero section
- Restrained animations with `prefers-reduced-motion` support

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| **v0.4.0** | 2025-03-15 | 🎬 **Multi-scene management** — Independent scenes (elements/scripts/background isolation), scene selector UI, per-scene background customization (color/image upload), script `switchScene()` navigation API, backward-compatible auto-migration |
| **v0.3.0** | 2025-03-15 | 🔦 **Advanced 3D lighting** — Spot light, hemisphere light, PCFSoft shadow mapping, PBR materials (metalness/roughness); 🌌 **Skybox** — Solid color / panorama mode + environment mapping; 🐛 Fixed 2D event/data elements rendering spurious blue squares |
| **v0.2.1** | 2025-03-15 | 🎮 Fixed 3D editor shortcuts (G/R/S/Del/1/3/7); 🖱️ Fixed FPS preview pointer lock persistence; ⚡ Fixed element disappearance during fast editing (async race); 🛡️ NaN/Infinity transform value guards |
| **v0.2.0** | 2025-03-14 | 📦 3D/2D asset libraries — Built-in open-source models and sprites; ⌨️ Blender-style 3D editor shortcut system; 📱 Mobile/tablet responsive layouts; 🖼️ 2D image element upload with async loading |
| **v0.1.0** | 2025-03-13 | 🎮 Dual engine architecture (PixiJS + Three.js); 🤖 AI code generation; 🧩 6 game templates; 🎨 Visual scene editor; 🌐 Chinese/English i18n |

---

## Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/ZetaZeroHub">
        <img src="https://github.com/ZetaZeroHub.png" width="80" style="border-radius:50%" /><br />
        <sub><b>ZetaZeroHub</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/kinglegendzzh">
        <img src="https://github.com/kinglegendzzh.png" width="80" style="border-radius:50%" /><br />
        <sub><b>kinglegendzzh</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/maxwellsection">
        <img src="https://github.com/maxwellsection.png" width="80" style="border-radius:50%" /><br />
        <sub><b>maxwellsection</b></sub>
      </a>
    </td>
  </tr>
</table>

## License

This project is licensed under the [Apache License 2.0](./LICENSE).

---

**The Reality Lab** — Reshaping the production paradigm of digital content.
