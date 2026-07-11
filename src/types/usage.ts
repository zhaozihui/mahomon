// Usage data types - migrated from src/core/monitor.py

export interface UsageData {
  // 累计数据
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;

  // 当前会话
  sessionTokens: number;
  sessionDuration: number;
  sessionInput: number;
  sessionOutput: number;
  sessionId: string;
  sessionCwd: string;
  sessionMessages: number;
  gitBranch: string;
  filesModified: number;

  // 总计
  totalSessions: number;
  totalMessages: number;
  version: string;

  // 实时会话信息
  modelName: string;
  contextPercent: number;
  cacheRemainingSeconds: number;
  memoryUsedGB: number;
  memoryTotalGB: number;
  memoryPercent: number;

  // 工具使用和压缩统计
  toolsUsed: Record<string, number>;
  compressionCount: number;
  skillsUsed: string[];

  timestamp: string;
}

export interface SessionInfo {
  sessionId: string;
  pid: number;
  cwd: string;
  startedAt: string;
  status: string;
  updatedAt: string;
}

export interface SystemData {
  cpu: number;
  memory: number;
  gpuUsage: number;
  networkUp: number;
  networkDown: number;
}

// 格式化函数
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(2)}M`;
  } else if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

export function formatSpeed(speedBps: number): string {
  if (speedBps < 1024) {
    return `${speedBps.toFixed(0)} B/s`;
  } else if (speedBps < 1024 * 1024) {
    return `${(speedBps / 1024).toFixed(1)} KB/s`;
  } else {
    return `${(speedBps / 1024 / 1024).toFixed(1)} MB/s`;
  }
}

export function formatCacheTime(seconds: number): string {
  if (seconds <= 0) return '0s';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}