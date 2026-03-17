import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Tool Store — Manages registered tools for AI assistant
 * Includes built-in tools, user-defined tools, MCP tools, and skill tools.
 */

// Built-in tool definitions (system tools, cannot be deleted)
const BUILTIN_TOOLS = [
  {
    id: 'builtin_update_code',
    name: 'update_code',
    displayName: '更新代码',
    description: '更新游戏主脚本代码。提供完整的新脚本内容来替换当前脚本。',
    source: 'builtin',
    enabled: true,
    deletable: false,
    parameters: {
      type: 'object',
      properties: {
        scriptName: { type: 'string', description: '要更新的脚本文件名，默认为 main.js' },
        code: { type: 'string', description: '完整的新脚本代码内容' },
        explanation: { type: 'string', description: '简要说明这次代码修改做了什么' },
      },
      required: ['code'],
    },
  },
  {
    id: 'builtin_add_element',
    name: 'add_element',
    displayName: '添加元素',
    description: '向游戏场景中添加一个新的元素（如图形、文字、按钮等）',
    source: 'builtin',
    enabled: true,
    deletable: false,
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['graphics', 'text', 'image', 'button', 'container', 'background', 'particles'], description: '元素类型' },
        name: { type: 'string', description: '元素的显示名称' },
        properties: { type: 'object', description: '元素属性：transform(x,y,width,height), style(fillColor,alpha,shape), textContent(text,fontSize,color)' },
      },
      required: ['type', 'name'],
    },
  },
  {
    id: 'builtin_update_element',
    name: 'update_element',
    displayName: '更新元素',
    description: '修改场景中已有元素的属性',
    source: 'builtin',
    enabled: true,
    deletable: false,
    parameters: {
      type: 'object',
      properties: {
        elementName: { type: 'string', description: '要修改的元素名称' },
        updates: { type: 'object', description: '要更新的属性键值对' },
      },
      required: ['elementName', 'updates'],
    },
  },
  {
    id: 'builtin_remove_element',
    name: 'remove_element',
    displayName: '删除元素',
    description: '从场景中删除指定元素',
    source: 'builtin',
    enabled: true,
    deletable: false,
    parameters: {
      type: 'object',
      properties: {
        elementName: { type: 'string', description: '要删除的元素名称' },
      },
      required: ['elementName'],
    },
  },
];

const useToolStore = create(
  persist(
    (set, get) => ({
      tools: [...BUILTIN_TOOLS],

      // ── Getters ──
      getEnabledTools: () => {
        return get().tools.filter(t => t.enabled);
      },

      getToolDefinitions: () => {
        return get().tools.filter(t => t.enabled).map(t => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        }));
      },

      getToolByName: (name) => {
        return get().tools.find(t => t.name === name);
      },

      getToolsBySource: (source) => {
        return get().tools.filter(t => t.source === source);
      },

      // ── Actions ──
      addTool: (tool) => {
        const id = tool.id || `tool_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newTool = {
          id,
          name: tool.name || '',
          displayName: tool.displayName || tool.name || '',
          description: tool.description || '',
          source: tool.source || 'custom',
          enabled: tool.enabled !== false,
          deletable: tool.deletable !== false,
          parameters: tool.parameters || { type: 'object', properties: {}, required: [] },
        };
        // Don't add duplicate names
        const existing = get().tools.find(t => t.name === newTool.name);
        if (existing) return existing.id;

        set(s => ({ tools: [...s.tools, newTool] }));
        return id;
      },

      updateTool: (id, updates) => {
        set(s => ({
          tools: s.tools.map(t => t.id === id ? { ...t, ...updates } : t),
        }));
      },

      removeTool: (id) => {
        const tool = get().tools.find(t => t.id === id);
        if (!tool || !tool.deletable) return;
        set(s => ({ tools: s.tools.filter(t => t.id !== id) }));
      },

      toggleTool: (id) => {
        set(s => ({
          tools: s.tools.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t),
        }));
      },

      // Register tools from MCP server
      registerMcpTools: (serverId, tools) => {
        const newTools = tools.map(t => ({
          id: `mcp_${serverId}_${t.name}`,
          name: t.name,
          displayName: t.name,
          description: t.description || '',
          source: `mcp:${serverId}`,
          enabled: true,
          deletable: true,
          parameters: t.inputSchema || t.parameters || { type: 'object', properties: {} },
        }));
        set(s => ({
          tools: [
            ...s.tools.filter(t => !t.source?.startsWith(`mcp:${serverId}`)),
            ...newTools,
          ],
        }));
      },

      // Unregister all tools from an MCP server
      unregisterMcpTools: (serverId) => {
        set(s => ({
          tools: s.tools.filter(t => !t.source?.startsWith(`mcp:${serverId}`)),
        }));
      },

      // Register tools from a Skill
      registerSkillTools: (skillId, tools) => {
        const newTools = tools.map(t => ({
          id: `skill_${skillId}_${t.name}`,
          name: t.name,
          displayName: t.displayName || t.name,
          description: t.description || '',
          source: `skill:${skillId}`,
          enabled: true,
          deletable: true,
          parameters: t.parameters || { type: 'object', properties: {} },
        }));
        set(s => ({
          tools: [
            ...s.tools.filter(t => !t.source?.startsWith(`skill:${skillId}`)),
            ...newTools,
          ],
        }));
      },

      unregisterSkillTools: (skillId) => {
        set(s => ({
          tools: s.tools.filter(t => !t.source?.startsWith(`skill:${skillId}`)),
        }));
      },

      // Reset to defaults
      resetTools: () => set({ tools: [...BUILTIN_TOOLS] }),
    }),
    {
      name: 'tool-registry-storage',
      partialize: (state) => ({ tools: state.tools }),
    },
  )
);

export default useToolStore;
