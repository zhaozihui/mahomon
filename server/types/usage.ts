// Usage data types for server

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
  version: string;
  entrypoint: string;
}

export interface SystemData {
  cpu: number;
  memory: number;
  networkUp: number;
  networkDown: number;
}