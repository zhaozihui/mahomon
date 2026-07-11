// Claude Monitor - reads ~/.claude files

import fs from 'fs';
import path from 'path';
import os from 'os';
import { UsageData, SessionInfo } from '../types/usage.js';

const CLAUDE_DIR = path.join(process.env.HOME || '', '.claude');
const STATS_CACHE_FILE = path.join(CLAUDE_DIR, 'stats-cache.json');
const SESSIONS_DIR = path.join(CLAUDE_DIR, 'sessions');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');
const SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json');

interface StatsCache {
  modelUsage: Record<string, { inputTokens: number; outputTokens: number }>;
  totalSessions: number;
  totalMessages: number;
}

interface CachedSessionData {
  input: number;
  output: number;
  messages: number;
  toolsUsed: Record<string, number>;
  compressionCount: number;
  skillsUsed: string[];
}

// 缓存实时数据，避免清零
let cachedLiveData: {
  modelName: string;
  contextPercent: number;
  cacheRemainingSeconds: number;
  memoryUsedGB: number;
  memoryTotalGB: number;
  memoryPercent: number;
  sessionCwd: string;
  gitBranch: string;
  filesModified: number;
  version: string;
  lastUpdate: number;
} = {
  modelName: '',
  contextPercent: 0,
  cacheRemainingSeconds: 300,
  memoryUsedGB: 0,
  memoryTotalGB: 32,
  memoryPercent: 0,
  sessionCwd: '',
  gitBranch: '',
  filesModified: 0,
  version: '',
  lastUpdate: 0,
};

let lastSessionFile: string | null = null;
let lastSessionSize: number = 0;
let cachedSessionData: CachedSessionData = {
  input: 0,
  output: 0,
  messages: 0,
  toolsUsed: {},
  compressionCount: 0,
  skillsUsed: [],
};

// 获取会话中实际使用的 Skills
function getUsedSkills(sessionFile: string): string[] {
  const skillsUsed: string[] = [];
  try {
    if (!fs.existsSync(sessionFile)) return [];
    const content = fs.readFileSync(sessionFile, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        // 检查 Skill 工具调用
        if (data.type === 'assistant' && data.message?.content) {
          for (const item of data.message.content) {
            if (item.type === 'tool_use' && item.name === 'Skill' && item.input?.skill) {
              const skillName = item.input.skill;
              if (!skillsUsed.includes(skillName)) {
                skillsUsed.push(skillName);
              }
            }
          }
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.error('Failed to get used skills:', error);
  }
  return skillsUsed;
}

// 获取启用的 Skills（作为备用显示）
function getEnabledSkills(): string[] {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return [];
    const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(content);
    const enabledPlugins = settings.enabledPlugins || {};
    return Object.keys(enabledPlugins)
      .filter(key => enabledPlugins[key] === true)
      .map(key => key.split('@')[0]);
  } catch {
    return [];
  }
}

export function getUsageData(): UsageData {
  const stats = loadStatsCache();
  const sessionData = getCurrentSessionUsage();
  const sessionInfo = getCurrentSession();

  // 从最新消息解析实时数据
  const liveData = parseLiveData();

  if (stats) {
    return parseStats(stats, sessionData, sessionInfo, liveData);
  }

  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cost: 0,
    sessionTokens: sessionData.input + sessionData.output,
    sessionDuration: 0,
    sessionInput: sessionData.input,
    sessionOutput: sessionData.output,
    sessionId: sessionInfo?.sessionId || '',
    sessionCwd: sessionInfo?.cwd || '',
    sessionMessages: sessionData.messages,
    gitBranch: liveData.gitBranch || cachedLiveData.gitBranch,
    filesModified: liveData.filesModified || cachedLiveData.filesModified,
    totalSessions: 0,
    totalMessages: 0,
    version: liveData.version || cachedLiveData.version,
    modelName: liveData.modelName || cachedLiveData.modelName,
    contextPercent: liveData.contextPercent || cachedLiveData.contextPercent,
    cacheRemainingSeconds: liveData.cacheRemainingSeconds || cachedLiveData.cacheRemainingSeconds,
    memoryUsedGB: liveData.memoryUsedGB || cachedLiveData.memoryUsedGB,
    memoryTotalGB: liveData.memoryTotalGB || cachedLiveData.memoryTotalGB,
    memoryPercent: liveData.memoryPercent || cachedLiveData.memoryPercent,
    toolsUsed: sessionData.toolsUsed,
    compressionCount: sessionData.compressionCount,
    skillsUsed: getEnabledSkills(),
    timestamp: new Date().toISOString(),
  };
}

// 解析实时会话数据
interface LiveData {
  modelName: string;
  contextPercent: number;
  cacheRemainingSeconds: number;
  memoryUsedGB: number;
  memoryTotalGB: number;
  memoryPercent: number;
  sessionCwd: string;
  gitBranch: string;
  filesModified: number;
  version: string;
}

function parseLiveData(): LiveData {
  const result: LiveData = { ...cachedLiveData };

  try {
    const sessionInfo = getCurrentSession();
    if (!sessionInfo) {
      // 没有 session 时使用系统内存
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      result.memoryUsedGB = Number((usedMem / 1024 / 1024 / 1024).toFixed(1));
      result.memoryTotalGB = Number((totalMem / 1024 / 1024 / 1024).toFixed(0));
      result.memoryPercent = Math.round((usedMem / totalMem) * 100);
      return result;
    }

    // 获取版本号
    result.version = sessionInfo.version || cachedLiveData.version;

    const jsonlPath = findSessionJsonl(sessionInfo.sessionId, sessionInfo.cwd);
    if (!jsonlPath) return result;

    const content = fs.readFileSync(jsonlPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    let lastInputTokens = 0;
    let lastCacheSeconds = 0;
    let lastCwd = sessionInfo.cwd;
    let lastGitBranch = '';
    const modifiedFiles = new Set<string>();

    // 遍历所有消息获取完整数据
    for (const line of lines) {
      try {
        const data = JSON.parse(line);

        // 获取最后一条 assistant 消息的数据
        if (data.type === 'assistant' && data.message?.usage) {
          const usage = data.message.usage;
          lastInputTokens = usage.input_tokens || 0;

          if (data.message.model) {
            result.modelName = formatModelName(data.message.model);
          }

          if (data.cwd) {
            lastCwd = data.cwd;
          }

          if (data.gitBranch) {
            lastGitBranch = data.gitBranch;
          }

          if (usage.cache_read_input_tokens !== undefined && usage.cache_read_input_tokens > 0) {
            lastCacheSeconds = 300;
          }
        }

        // 统计修改的文件
        if (data.type === 'user' && data.toolUseResult?.filePath) {
          modifiedFiles.add(data.toolUseResult.filePath);
        }
        if (data.message?.content && Array.isArray(data.message.content)) {
          for (const item of data.message.content) {
            if (item.type === 'tool_use' && item.name === 'Edit' && item.input?.file_path) {
              modifiedFiles.add(item.input.file_path);
            }
            if (item.type === 'tool_use' && item.name === 'Write' && item.input?.file_path) {
              modifiedFiles.add(item.input.file_path);
            }
          }
        }
      } catch {
        continue;
      }
    }

    // 计算上下文使用百分比
    const contextWindow = getContextWindow(result.modelName);
    result.contextPercent = Math.min(100, Math.round((lastInputTokens / contextWindow) * 100));

    // 缓存剩余时间
    if (lastCacheSeconds > 0) {
      const elapsed = Math.floor((Date.now() - cachedLiveData.lastUpdate) / 1000);
      result.cacheRemainingSeconds = Math.max(0, 300 - elapsed);
    } else {
      result.cacheRemainingSeconds = cachedLiveData.cacheRemainingSeconds;
    }

    // 更新工作目录和分支
    if (lastCwd) result.sessionCwd = lastCwd;
    if (lastGitBranch) result.gitBranch = lastGitBranch;
    result.filesModified = modifiedFiles.size;

    // 内存使用
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    result.memoryUsedGB = Number((usedMem / 1024 / 1024 / 1024).toFixed(1));
    result.memoryTotalGB = Number((totalMem / 1024 / 1024 / 1024).toFixed(0));
    result.memoryPercent = Math.round((usedMem / totalMem) * 100);

    // 更新缓存
    cachedLiveData = {
      ...result,
      lastUpdate: Date.now(),
    };

  } catch (error) {
    console.error('Failed to parse live data:', error);
  }

  return result;
}

// 格式化模型名称
function formatModelName(model: string): string {
  if (!model) return '';

  // 移除 <> 包裹
  let name = model.replace(/^<|>$/g, '');

  // 简化名称
  const modelMap: Record<string, string> = {
    'claude-opus-4-7': 'Opus 4.7',
    'claude-sonnet-4-6': 'Sonnet 4.6',
    'claude-haiku-4-5': 'Haiku 4.5',
    'astron-code-latest': 'Astron',
    'claude-3-5-sonnet': 'Sonnet 3.5',
    'claude-3-opus': 'Opus 3',
  };

  for (const [key, value] of Object.entries(modelMap)) {
    if (name.includes(key)) return value;
  }

  return name;
}

// 获取模型的上下文窗口大小
function getContextWindow(modelName: string): number {
  if (modelName.includes('Opus') || modelName.includes('Sonnet')) {
    return 200000; // 200K
  }
  if (modelName.includes('Haiku')) {
    return 200000;
  }
  return 200000; // 默认 200K
}

function findSessionJsonl(sessionId: string, cwd: string): string | null {
  try {
    if (!fs.existsSync(PROJECTS_DIR)) return null;

    const projectDirs = fs.readdirSync(PROJECTS_DIR);
    for (const projectDir of projectDirs) {
      const projectPath = path.join(PROJECTS_DIR, projectDir);
      if (!fs.statSync(projectPath).isDirectory()) continue;

      const jsonlFiles = fs.readdirSync(projectPath).filter(f => f.endsWith('.jsonl'));
      for (const jsonlFile of jsonlFiles) {
        const jsonlPath = path.join(projectPath, jsonlFile);
        if (checkSessionId(jsonlPath, sessionId)) {
          return jsonlPath;
        }
      }
    }

    const projectDir = findProjectByCwd(cwd);
    if (projectDir) {
      const jsonlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.jsonl'));
      if (jsonlFiles.length > 0) {
        jsonlFiles.sort((a, b) => {
          const statA = fs.statSync(path.join(projectDir, a));
          const statB = fs.statSync(path.join(projectDir, b));
          return statB.mtimeMs - statA.mtimeMs;
        });
        return path.join(projectDir, jsonlFiles[0]);
      }
    }
  } catch (error) {
    console.error('Failed to find session jsonl:', error);
  }

  return null;
}

function loadStatsCache(): StatsCache | null {
  try {
    if (!fs.existsSync(STATS_CACHE_FILE)) {
      console.warn(`Stats cache file not found: ${STATS_CACHE_FILE}`);
      return null;
    }

    const content = fs.readFileSync(STATS_CACHE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load stats cache:', error);
    return null;
  }
}

function getCurrentSessionUsage(): CachedSessionData {
  try {
    const sessionInfo = getCurrentSession();
    if (!sessionInfo) {
      return cachedSessionData;
    }

    const sessionId = sessionInfo.sessionId;
    const cwd = sessionInfo.cwd;

    if (fs.existsSync(PROJECTS_DIR)) {
      const projectDirs = fs.readdirSync(PROJECTS_DIR);
      for (const projectDir of projectDirs) {
        const projectPath = path.join(PROJECTS_DIR, projectDir);
        if (!fs.statSync(projectPath).isDirectory()) continue;

        const jsonlFiles = fs.readdirSync(projectPath).filter(f => f.endsWith('.jsonl'));
        for (const jsonlFile of jsonlFiles) {
          const jsonlPath = path.join(projectPath, jsonlFile);
          if (checkSessionId(jsonlPath, sessionId)) {
            return parseSessionJsonl(jsonlPath);
          }
        }
      }

      const projectDir = findProjectByCwd(cwd);
      if (projectDir) {
        const jsonlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.jsonl'));
        if (jsonlFiles.length > 0) {
          jsonlFiles.sort((a, b) => {
            const statA = fs.statSync(path.join(projectDir, a));
            const statB = fs.statSync(path.join(projectDir, b));
            return statB.mtimeMs - statA.mtimeMs;
          });
          return parseSessionJsonl(path.join(projectDir, jsonlFiles[0]));
        }
      }
    }
  } catch (error) {
    console.error('Failed to get current session usage:', error);
  }

  return cachedSessionData;
}

function checkSessionId(jsonlPath: string, sessionId: string): boolean {
  try {
    const content = fs.readFileSync(jsonlPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length === 0) return false;

    const firstLine = JSON.parse(lines[0]);
    return firstLine.sessionId === sessionId;
  } catch {
    return false;
  }
}

function findProjectByCwd(cwd: string): string | null {
  if (!cwd) return null;

  let cwdNormalized = cwd.replace(/\\/g, '-').replace(/:/g, '').replace(/ /g, '-');
  cwdNormalized = cwdNormalized.replace(/^-+|-+$/g, '');

  try {
    const projectDirs = fs.readdirSync(PROJECTS_DIR);
    for (const projectDir of projectDirs) {
      const projectPath = path.join(PROJECTS_DIR, projectDir);
      if (!fs.statSync(projectPath).isDirectory()) continue;

      if (projectDir === cwdNormalized) {
        return projectPath;
      }

      const jsonlFiles = fs.readdirSync(projectPath).filter(f => f.endsWith('.jsonl'));
      for (const jsonlFile of jsonlFiles) {
        const jsonlPath = path.join(projectPath, jsonlFile);
        if (checkCwd(jsonlPath, cwd)) {
          return projectPath;
        }
      }
    }
  } catch (error) {
    console.error('Failed to find project by cwd:', error);
  }

  return null;
}

function checkCwd(jsonlPath: string, cwd: string): boolean {
  try {
    const content = fs.readFileSync(jsonlPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim()).slice(0, 10);

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.cwd) {
          const normalizedFileCwd = data.cwd.replace(/\\/g, '/');
          const normalizedCwd = cwd.replace(/\\/g, '/');
          return normalizedFileCwd === normalizedCwd;
        }
      } catch {
        continue;
      }
    }
  } catch {
    return false;
  }
  return false;
}

function parseSessionJsonl(sessionFile: string): CachedSessionData {
  const result: CachedSessionData = {
    input: 0,
    output: 0,
    messages: 0,
    toolsUsed: {},
    compressionCount: 0,
    skillsUsed: [],
  };

  try {
    const currentSize = fs.statSync(sessionFile).size;
    if (sessionFile === lastSessionFile && currentSize === lastSessionSize) {
      return cachedSessionData;
    }

    lastSessionFile = sessionFile;
    lastSessionSize = currentSize;

    const content = fs.readFileSync(sessionFile, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    let messageCount = 0;
    let totalInput = 0;
    let totalOutput = 0;
    const toolsUsed: Record<string, number> = {};
    let compressionCount = 0;
    const skillsUsed: string[] = [];

    for (const line of lines) {
      try {
        const data = JSON.parse(line);

        if (data.type === 'user' || data.type === 'assistant') {
          messageCount++;
        }

        if (data.type === 'assistant') {
          const usage = data.message?.usage;
          if (usage) {
            totalInput += usage.input_tokens || 0;
            totalOutput += usage.output_tokens || 0;
          }

          // 统计工具使用
          if (data.message?.content && Array.isArray(data.message.content)) {
            for (const item of data.message.content) {
              if (item.type === 'tool_use' && item.name) {
                toolsUsed[item.name] = (toolsUsed[item.name] || 0) + 1;
                // 检查 Skill 工具调用
                if (item.name === 'Skill' && item.input?.skill) {
                  const skillName = item.input.skill;
                  if (!skillsUsed.includes(skillName)) {
                    skillsUsed.push(skillName);
                  }
                }
              }
            }
          }

          // 统计压缩次数
          if (data.message?.context_management !== null && data.message?.context_management !== undefined) {
            compressionCount++;
          }
        }
      } catch {
        continue;
      }
    }

    result.input = totalInput;
    result.output = totalOutput;
    result.messages = messageCount;
    result.toolsUsed = toolsUsed;
    result.compressionCount = compressionCount;
    result.skillsUsed = skillsUsed;

    cachedSessionData = result;
  } catch (error) {
    console.error('Failed to parse session JSONL:', error);
    return cachedSessionData;
  }

  return result;
}

function parseStats(
  stats: StatsCache,
  sessionData: CachedSessionData,
  sessionInfo: SessionInfo | null,
  liveData: LiveData
): UsageData {
  let totalInput = 0;
  let totalOutput = 0;

  for (const usage of Object.values(stats.modelUsage || {})) {
    totalInput += usage.inputTokens || 0;
    totalOutput += usage.outputTokens || 0;
  }

  const totalTokens = totalInput + totalOutput;
  const cost = (totalInput * 3.0 + totalOutput * 15.0) / 1_000_000;

  let sessionDuration = 0;
  let sessionId = '';
  // 使用 liveData 中的 cwd（最新的）
  let sessionCwd = liveData.sessionCwd || '';

  if (sessionInfo) {
    const startedAt = new Date(sessionInfo.startedAt);
    sessionDuration = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    sessionId = sessionInfo.sessionId;
    if (!sessionCwd) {
      sessionCwd = sessionInfo.cwd;
    }
  }

  return {
    inputTokens: totalInput,
    outputTokens: totalOutput,
    totalTokens,
    cost,
    sessionTokens: sessionData.input + sessionData.output,
    sessionDuration,
    sessionInput: sessionData.input,
    sessionOutput: sessionData.output,
    sessionId,
    sessionCwd,
    sessionMessages: sessionData.messages,
    gitBranch: liveData.gitBranch || cachedLiveData.gitBranch,
    filesModified: liveData.filesModified || cachedLiveData.filesModified,
    totalSessions: stats.totalSessions || 0,
    totalMessages: stats.totalMessages || 0,
    version: liveData.version || cachedLiveData.version,
    modelName: liveData.modelName || cachedLiveData.modelName,
    contextPercent: liveData.contextPercent || cachedLiveData.contextPercent,
    cacheRemainingSeconds: liveData.cacheRemainingSeconds || cachedLiveData.cacheRemainingSeconds,
    memoryUsedGB: liveData.memoryUsedGB || cachedLiveData.memoryUsedGB,
    memoryTotalGB: liveData.memoryTotalGB || cachedLiveData.memoryTotalGB,
    memoryPercent: liveData.memoryPercent || cachedLiveData.memoryPercent,
    toolsUsed: sessionData.toolsUsed,
    compressionCount: sessionData.compressionCount,
    skillsUsed: sessionData.skillsUsed,
    timestamp: new Date().toISOString(),
  };
}

export function getCurrentSession(): SessionInfo | null {
  try {
    if (!fs.existsSync(SESSIONS_DIR)) {
      return null;
    }

    const sessionFiles = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));

    for (const sessionFile of sessionFiles) {
      try {
        const sessionPath = path.join(SESSIONS_DIR, sessionFile);
        const content = fs.readFileSync(sessionPath, 'utf-8');
        const data = JSON.parse(content);

        if (data.status === 'busy') {
          let startedAtISO: string;
          if (typeof data.startedAt === 'number') {
            startedAtISO = new Date(data.startedAt).toISOString();
          } else {
            startedAtISO = data.startedAt;
          }

          return {
            sessionId: data.sessionId || '',
            pid: data.pid || 0,
            cwd: data.cwd || '',
            startedAt: startedAtISO,
            status: data.status,
            updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : new Date().toISOString(),
            version: data.version || '',
            entrypoint: data.entrypoint || '',
          };
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.error('Failed to get current session:', error);
  }

  return null;
}