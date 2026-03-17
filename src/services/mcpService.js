/**
 * MCP (Model Context Protocol) Client Service
 * Connects to MCP servers via SSE/Streamable HTTP transport.
 * Discovers and calls tools from MCP servers.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useToolStore from '../stores/toolStore';

// ── MCP Store ──
export const useMcpStore = create(
  persist(
    (set, get) => ({
      servers: [],
      // Each server: { id, name, url, status: 'disconnected'|'connecting'|'connected'|'error', error: '' }

      addServer: (server) => {
        const id = `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        set(s => ({
          servers: [...s.servers, {
            id,
            name: server.name || 'MCP Server',
            url: server.url || '',
            transport: server.transport || 'sse', // 'sse' | 'streamable-http'
            status: 'disconnected',
            error: '',
            toolCount: 0,
          }],
        }));
        return id;
      },

      updateServer: (id, updates) => {
        set(s => ({
          servers: s.servers.map(srv => srv.id === id ? { ...srv, ...updates } : srv),
        }));
      },

      removeServer: (id) => {
        // Unregister tools first
        useToolStore.getState().unregisterMcpTools(id);
        set(s => ({
          servers: s.servers.filter(srv => srv.id !== id),
        }));
      },

      getServer: (id) => get().servers.find(s => s.id === id),
    }),
    {
      name: 'mcp-servers-storage',
      partialize: (state) => ({
        servers: state.servers.map(s => ({
          ...s,
          status: 'disconnected',
          error: '',
          toolCount: 0,
        })),
      }),
    }
  )
);

/**
 * Connect to an MCP server and discover tools
 * Uses SSE transport (Server-Sent Events)
 */
export async function connectMcpServer(serverId) {
  const mcpStore = useMcpStore.getState();
  const server = mcpStore.getServer(serverId);
  if (!server) throw new Error('Server not found');

  mcpStore.updateServer(serverId, { status: 'connecting', error: '' });

  try {
    const baseUrl = server.url.replace(/\/+$/, '');

    // Step 1: Initialize
    const initResponse = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-03-26',
          capabilities: {},
          clientInfo: { name: 'ZetaStudio', version: '1.0.0' },
        },
      }),
    });

    if (!initResponse.ok) {
      throw new Error(`初始化失败 (${initResponse.status})`);
    }

    // Step 2: List tools
    const toolsResponse = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      }),
    });

    if (!toolsResponse.ok) {
      throw new Error(`获取工具列表失败 (${toolsResponse.status})`);
    }

    const toolsResult = await toolsResponse.json();
    const tools = toolsResult.result?.tools || [];

    // Register tools
    useToolStore.getState().registerMcpTools(serverId, tools);

    mcpStore.updateServer(serverId, {
      status: 'connected',
      error: '',
      toolCount: tools.length,
    });

    return tools;
  } catch (error) {
    mcpStore.updateServer(serverId, {
      status: 'error',
      error: error.message,
    });
    throw error;
  }
}

/**
 * Disconnect from an MCP server
 */
export function disconnectMcpServer(serverId) {
  useToolStore.getState().unregisterMcpTools(serverId);
  useMcpStore.getState().updateServer(serverId, {
    status: 'disconnected',
    toolCount: 0,
  });
}

/**
 * Call a tool on an MCP server
 */
export async function callMcpTool(serverId, toolName, args = {}) {
  const server = useMcpStore.getState().getServer(serverId);
  if (!server || server.status !== 'connected') {
    throw new Error('MCP 服务器未连接');
  }

  const baseUrl = server.url.replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    }),
  });

  if (!response.ok) {
    throw new Error(`工具调用失败 (${response.status})`);
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.error.message || '工具调用错误');
  }

  return result.result;
}

export default { useMcpStore, connectMcpServer, disconnectMcpServer, callMcpTool };
