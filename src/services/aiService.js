/**
 * AI Service - Real LLM integration
 * Supports OpenAI-compatible APIs (SiliconFlow, DeepSeek, OpenAI, etc.) and Ollama.
 */

import useLlmStore from '../stores/llmStore';
import { buildSystemPrompt, getToolDefinitions } from './promptTemplates';

/**
 * Call LLM API with OpenAI-compatible protocol
 * @param {Array} messages - Chat messages array
 * @param {object} config - { apiBase, apiKey, model, protocol }
 * @param {object} options - { tools, onChunk, signal }
 * @returns {Promise<object>} API response
 */
async function callOpenAI(messages, config, options = {}) {
  const { apiBase, apiKey, model } = config;
  const endpoint = `${apiBase.replace(/\/+$/, '')}/chat/completions`;

  const body = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
    stream: !!options.onChunk,
  };

  // Add tools if available and the model supports them
  if (options.tools && options.tools.length > 0) {
    body.tools = options.tools;
    body.tool_choice = 'auto';
  }

  const headers = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let errorMsg = `API 调用失败 (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMsg = errorJson.error?.message || errorJson.message || errorMsg;
    } catch { /* use default */ }
    throw new Error(errorMsg);
  }

  // Non-streaming response
  if (!options.onChunk) {
    const data = await response.json();
    return data;
  }

  // Streaming response (SSE)
  return await handleSSEStream(response, options.onChunk);
}

/**
 * Handle SSE stream from OpenAI-compatible API
 */
async function handleSSEStream(response, onChunk) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  let toolCalls = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const chunk = JSON.parse(data);
          const delta = chunk.choices?.[0]?.delta;
          if (!delta) continue;

          // Content streaming
          if (delta.content) {
            fullContent += delta.content;
            onChunk({ type: 'content', content: delta.content, fullContent });
          }

          // Tool call streaming
          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCalls[idx]) {
                toolCalls[idx] = {
                  id: tc.id || `call_${idx}`,
                  type: 'function',
                  function: { name: '', arguments: '' },
                };
              }
              if (tc.function?.name) {
                toolCalls[idx].function.name += tc.function.name;
              }
              if (tc.function?.arguments) {
                toolCalls[idx].function.arguments += tc.function.arguments;
              }
            }
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    choices: [{
      message: {
        role: 'assistant',
        content: fullContent || null,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      },
      finish_reason: toolCalls.length > 0 ? 'tool_calls' : 'stop',
    }],
  };
}

/**
 * Call Ollama API
 * @param {Array} messages - Chat messages array
 * @param {object} config - { apiBase, model }
 * @param {object} options - { onChunk, signal }
 */
async function callOllama(messages, config, options = {}) {
  const { apiBase, model } = config;
  const endpoint = `${apiBase.replace(/\/+$/, '')}/api/chat`;

  const body = {
    model,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    stream: !!options.onChunk,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama API 调用失败 (${response.status})`);
  }

  if (!options.onChunk) {
    const data = await response.json();
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: data.message?.content || '',
        },
        finish_reason: 'stop',
      }],
    };
  }

  // Streaming (Ollama uses NDJSON, not SSE)
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line);
          if (chunk.message?.content) {
            fullContent += chunk.message.content;
            options.onChunk({
              type: 'content',
              content: chunk.message.content,
              fullContent,
            });
          }
        } catch { /* skip */ }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    choices: [{
      message: { role: 'assistant', content: fullContent },
      finish_reason: 'stop',
    }],
  };
}

/**
 * Unified LLM call dispatcher
 */
async function callLLM(messages, options = {}) {
  const config = useLlmStore.getState().getActiveConfig();
  if (!config) {
    throw new Error('未配置 LLM 供应商，请先在设置中配置 API');
  }

  if (config.protocol === 'ollama') {
    return callOllama(messages, config, options);
  }
  return callOpenAI(messages, config, options);
}

/**
 * Parse code blocks from AI response text
 * @param {string} text
 * @returns {{ cleanText: string, codeBlocks: Array<{lang: string, code: string}> }}
 */
function parseCodeBlocks(text) {
  if (!text) return { cleanText: '', codeBlocks: [] };

  const codeBlocks = [];
  const cleanText = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    codeBlocks.push({ lang: lang || 'javascript', code: code.trim() });
    return `\n[代码块 ${codeBlocks.length}]\n`;
  });

  return { cleanText: cleanText.trim(), codeBlocks };
}

/**
 * Process tool calls from the LLM response
 * @param {Array} toolCalls - Tool calls from the response
 * @returns {Array<{name: string, args: object, id: string}>} Parsed tool calls
 */
function parseToolCalls(toolCalls) {
  if (!toolCalls || toolCalls.length === 0) return [];

  return toolCalls.map(tc => {
    let args = {};
    try {
      args = JSON.parse(tc.function.arguments);
    } catch {
      // Try to recover from partial JSON
      args = { raw: tc.function.arguments };
    }
    return {
      id: tc.id,
      name: tc.function.name,
      args,
    };
  });
}

/**
 * Fallback: parse tool calls from text content when models output them as text
 * Supports multiple formats used by different models:
 * - <tool_call>{"name":"...","arguments":{...}}</tool_call>
 * - ✿FUNCTION✿ format (Qwen-style)
 * - Raw JSON with known function names
 */
function parseToolCallsFromText(text) {
  if (!text) return [];
  const results = [];

  // Pattern 1: <tool_call>JSON</tool_call>
  const toolCallTagRegex = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/gi;
  let match;
  while ((match = toolCallTagRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      results.push({
        id: `text_tc_${results.length}`,
        name: parsed.name || parsed.function?.name || '',
        args: parsed.arguments || parsed.function?.arguments || parsed.parameters || {},
      });
    } catch { /* skip */ }
  }

  // Pattern 2: ✿FUNCTION✿ name ✿ARGS✿ json ✿RESULT✿ (Qwen chat format)
  const qwenRegex = /✿FUNCTION✿\s*(\w+)\s*\n✿ARGS✿\s*([\s\S]*?)(?:\n✿|$)/gi;
  while ((match = qwenRegex.exec(text)) !== null) {
    try {
      const args = JSON.parse(match[2].trim());
      results.push({
        id: `text_tc_${results.length}`,
        name: match[1],
        args,
      });
    } catch { /* skip */ }
  }

  // Pattern 3: Look for JSON objects with known tool names in text
  const knownTools = ['update_code', 'add_element', 'update_element', 'remove_element'];
  const jsonBlockRegex = /\{[\s\S]*?"(?:name|function)"[\s\S]*?\}/g;
  if (results.length === 0) {
    while ((match = jsonBlockRegex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[0]);
        const name = parsed.name || parsed.function;
        if (name && knownTools.includes(name)) {
          results.push({
            id: `text_tc_${results.length}`,
            name,
            args: parsed.arguments || parsed.parameters || {},
          });
        }
      } catch { /* skip incomplete JSON */ }
    }
  }

  return results;
}

/**
 * Main entry: Generate game code from user prompt
 * Replaces the old mock implementation.
 *
 * @param {string} prompt - User's message
 * @param {object} context - Project context
 * @param {string} context.templateType
 * @param {string} context.dimension
 * @param {Array} context.elements
 * @param {Array} context.scripts
 * @param {Array} context.conversationHistory - Previous messages
 * @param {function} context.onChunk - Streaming callback
 * @param {AbortSignal} context.signal - Abort signal
 * @returns {Promise<{message: string, toolCalls: Array, code: string|null}>}
 */
export async function generateGameCode(prompt, context = {}) {
  const {
    templateType = '',
    dimension = '2D',
    elements = [],
    scripts = [],
    conversationHistory = [],
    onChunk = null,
    signal = null,
  } = context;

  const llmState = useLlmStore.getState();
  const aiMode = llmState.aiMode;

  // Build system prompt with engine context
  const systemPrompt = buildSystemPrompt({
    dimension,
    templateType,
    elements,
    scripts,
    aiMode,
  });

  // Construct messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: prompt },
  ];

  // Determine if we should use tools (only in act mode with OpenAI-compatible)
  const config = llmState.getActiveConfig();
  const useTools = aiMode === 'act' && config?.protocol !== 'ollama';

  // Call LLM
  const response = await callLLM(messages, {
    tools: useTools ? getToolDefinitions() : undefined,
    onChunk,
    signal,
  });

  const assistantMessage = response.choices?.[0]?.message;
  if (!assistantMessage) {
    throw new Error('AI 返回了空响应');
  }

  const content = assistantMessage.content || '';
  let toolCalls = parseToolCalls(assistantMessage.tool_calls);

  // Fallback: parse tool calls from text content if the model outputs them as text
  // Some models (e.g. Qwen2.5-7B) may output tool calls in text format
  if (toolCalls.length === 0 && content) {
    const textToolCalls = parseToolCallsFromText(content);
    if (textToolCalls.length > 0) {
      toolCalls = textToolCalls;
    }
  }

  // Parse any inline code blocks from the text response
  const { cleanText, codeBlocks } = parseCodeBlocks(content);

  // Try to extract the main code (first JS block)
  const mainCode = codeBlocks.find(b => b.lang === 'javascript' || b.lang === 'js')?.code || null;

  return {
    message: cleanText || content,
    toolCalls,
    code: mainCode,
    codeBlocks,
    rawContent: content,
  };
}

/**
 * Test LLM connection
 * @returns {Promise<{success: boolean, message: string, model: string}>}
 */
export async function testConnection() {
  try {
    const response = await callLLM([
      { role: 'system', content: 'Reply with exactly: "连接成功"' },
      { role: 'user', content: 'test' },
    ]);

    const content = response.choices?.[0]?.message?.content || '';
    const model = useLlmStore.getState().activeModel;
    return {
      success: true,
      message: content.slice(0, 100),
      model,
    };
  } catch (e) {
    return {
      success: false,
      message: e.message,
      model: '',
    };
  }
}
