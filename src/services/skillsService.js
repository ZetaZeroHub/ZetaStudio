/**
 * Skills Service — Manage AI assistant skill presets
 * Skills augment the AI with specialized knowledge and tools.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useToolStore from '../stores/toolStore';

// Built-in skill presets
const BUILTIN_SKILLS = [
  {
    id: 'skill_pixi_expert',
    name: 'PixiJS 专家',
    description: '增强 AI 对 PixiJS v8 API 的理解，包括精灵动画、粒子系统、滤镜效果和物理模拟。',
    icon: '🎮',
    source: 'builtin',
    enabled: false,
    systemPromptAppend: `
## PixiJS 高级知识
你现在也精通以下高级 PixiJS 特性：
- **粒子系统**: 使用 Graphics + ticker 手动创建高性能粒子，控制生命周期、速度、加速度、颜色渐变
- **帧动画**: AnimatedSprite 结合 spritesheet JSON，支持多组动画切换
- **滤镜链**: 组合 BlurFilter, ColorMatrixFilter, DisplacementFilter 创建视觉效果
- **碰撞检测**: AABB 矩形碰撞、getBounds()、圆形碰撞公式
- **对象池**: 重用 display objects 避免 GC，用于子弹、粒子等高频创建销毁场景
- **响应式布局**: 监听 resize 事件，动态调整 stage scale 和 position
在代码中优先使用这些技术来实现更专业的游戏效果。
`,
    tools: [],
  },
  {
    id: 'skill_threejs_expert',
    name: 'Three.js 专家',
    description: '增强 AI 对 Three.js 的理解，包括 PBR 材质、后处理、TSL 着色器和性能优化。',
    icon: '🌐',
    source: 'builtin',
    enabled: false,
    systemPromptAppend: `
## Three.js 高级知识
你现在也精通以下高级 Three.js 特性：
- **PBR 材质**: MeshPhysicalMaterial 的 clearcoat, transmission, ior, thickness 参数
- **后处理**: EffectComposer + RenderPass + UnrealBloomPass + SMAAPass
- **环境贴图**: HDR 环境光照，PMREMGenerator
- **阴影优化**: PCFSoftShadowMap, shadow camera bounds 调优
- **InstancedMesh**: 批量渲染数千个相同几何体，setMatrixAt/setColorAt
- **LOD**: 多级别细节，根据距离切换模型精度
- **骨骼动画**: AnimationMixer, 动画混合和交叉淡入淡出
在代码中优先使用这些技术来实现更专业的 3D 效果。
`,
    tools: [],
  },
  {
    id: 'skill_animation',
    name: '动画专家',
    description: '增强 AI 对游戏动画的理解，包括缓动函数、状态机、过渡效果。',
    icon: '✨',
    source: 'builtin',
    enabled: false,
    systemPromptAppend: `
## 游戏动画专家
你精通各种游戏动画技术：
- **缓动函数**: easeIn/Out/InOut (quad, cubic, elastic, bounce, back) 的数学公式和应用场景
- **补间动画**: 手动实现 lerp, smoothstep, spring 插值
- **状态机**: 管理角色动画状态（idle, walk, jump, attack）及过渡
- **关键帧**: 时间轴驱动的属性动画
- **粒子效果**: 爆炸、拖尾、烟雾、火焰、闪光等
- **屏幕效果**: 屏幕抖动、闪白、慢动作、缩放特写
实现动画时注重流畅性和视觉冲击力。
`,
    tools: [],
  },
  {
    id: 'skill_game_design',
    name: '游戏设计顾问',
    description: '提供游戏设计建议，包括关卡设计、难度曲线、玩法机制和用户体验。',
    icon: '🎯',
    source: 'builtin',
    enabled: false,
    systemPromptAppend: `
## 游戏设计顾问
你同时也是一位经验丰富的游戏设计师：
- **关卡设计**: 难度曲线（渐进式、波浪式）、节奏控制、成就感设计
- **核心玩法**: 输入→反馈循环、风险收益平衡、随机性控制
- **角色平衡**: 属性数值设计、DPS/Tank/Support 三角
- **UI/UX**: 游戏 HUD 设计、菜单流程、教学引导
- **心流理论**: 技能-挑战平衡、即时反馈、清晰目标
在给出代码建议的同时，也会提供游戏设计维度的建议。
`,
    tools: [],
  },
];

export const useSkillStore = create(
  persist(
    (set, get) => ({
      skills: [...BUILTIN_SKILLS],

      // ── Getters ──
      getEnabledSkills: () => get().skills.filter(s => s.enabled),

      getSkillPromptAppends: () => {
        return get().skills
          .filter(s => s.enabled && s.systemPromptAppend)
          .map(s => s.systemPromptAppend)
          .join('\n');
      },

      // ── Actions ──
      toggleSkill: (id) => {
        const skill = get().skills.find(s => s.id === id);
        if (!skill) return;
        const newEnabled = !skill.enabled;
        set(s => ({
          skills: s.skills.map(sk => sk.id === id ? { ...sk, enabled: newEnabled } : sk),
        }));

        // Register/unregister tools
        if (newEnabled && skill.tools.length > 0) {
          useToolStore.getState().registerSkillTools(id, skill.tools);
        } else {
          useToolStore.getState().unregisterSkillTools(id);
        }
      },

      addSkill: (skill) => {
        const id = `skill_custom_${Date.now()}`;
        const newSkill = {
          id,
          name: skill.name || '自定义技能',
          description: skill.description || '',
          icon: skill.icon || '🔧',
          source: 'custom',
          enabled: false,
          systemPromptAppend: skill.systemPromptAppend || '',
          tools: skill.tools || [],
        };
        set(s => ({ skills: [...s.skills, newSkill] }));
        return id;
      },

      updateSkill: (id, updates) => {
        set(s => ({
          skills: s.skills.map(sk => sk.id === id ? { ...sk, ...updates } : sk),
        }));
      },

      removeSkill: (id) => {
        const skill = get().skills.find(s => s.id === id);
        if (!skill || skill.source === 'builtin') return;
        useToolStore.getState().unregisterSkillTools(id);
        set(s => ({ skills: s.skills.filter(sk => sk.id !== id) }));
      },

      resetSkills: () => set({ skills: [...BUILTIN_SKILLS] }),
    }),
    {
      name: 'skills-storage',
      partialize: (state) => ({ skills: state.skills }),
    }
  )
);

export default useSkillStore;
