// Session Bubble - Current session info + System monitoring

import { useUsageData } from '../stores/usageStore';
import { useSystemData } from '../stores/usageStore';
import { formatTokens, formatDuration, formatCacheTime, formatSpeed } from '../types/usage';
import { BarChart3, FolderGit2, GitBranch, FileEdit, Database, Timer, MessageSquare, Clock, Wrench, Monitor, Cpu, HardDrive, Wifi, ArrowUp, ArrowDown, CpuIcon, DollarSign, PieChart, Sparkles } from 'lucide-react';

interface ProgressBarProps {
  value: number;
  color: string;
}

function ProgressBar({ value, color }: ProgressBarProps) {
  const getColor = (val: number) => {
    if (val > 80) return 'bg-rose-400';
    if (val > 50) return 'bg-amber-400';
    return color;
  };

  return (
    <div className="h-[clamp(4px,0.5vw,8px)] rounded-full bg-slate-700/80 overflow-hidden">
      <div
        className={`h-full ${getColor(value)} transition-all duration-300 rounded-full`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export function SessionBubble() {
  const usage = useUsageData();
  const system = useSystemData();

  if (!usage) {
    return (
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 text-white w-full h-full flex items-center justify-center">
        <div className="text-[clamp(12px,1.5vw,14px)] text-gray-400">Loading...</div>
      </div>
    );
  }

  const sessionCost = (usage.sessionInput * 3.0 + usage.sessionOutput * 15.0) / 1_000_000;
  const outputRatio = usage.sessionInput + usage.sessionOutput > 0
    ? ((usage.sessionOutput / (usage.sessionInput + usage.sessionOutput)) * 100).toFixed(1)
    : '0';

  // 获取项目名称（路径最后一级）
  const projectName = usage.sessionCwd ? usage.sessionCwd.split(/[\\/]/).pop() : '';

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-[clamp(8px,1vw,12px)] text-white w-full h-full flex flex-col">
      {/* 标题行 */}
      <div className="text-[clamp(12px,1.5vw,14px)] text-violet-300 font-semibold mb-2 flex items-center gap-1.5">
        <BarChart3 className="w-[clamp(14px,1.5vw,18px)] h-[clamp(14px,1.5vw,18px)]" />
        <span>Session</span>
      </div>

      {/* Project info */}
      <div className="bg-slate-800/50 rounded-lg p-[clamp(6px,0.8vw,10px)] border border-slate-700/50 mb-2 text-[clamp(10px,1.2vw,12px)]">
        {projectName && (
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-400 flex items-center gap-1">
              <FolderGit2 className="w-[clamp(12px,1.2vw,14px)] h-[clamp(12px,1.2vw,14px)]" />
              Project
            </span>
            <span className="text-slate-200 font-medium">{projectName}</span>
          </div>
        )}
        {usage.modelName && (
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-[clamp(12px,1.2vw,14px)] h-[clamp(12px,1.2vw,14px)]" />
              Model
            </span>
            <span className="text-rose-300 font-medium">{usage.modelName}</span>
          </div>
        )}
        {usage.gitBranch && (
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-400 flex items-center gap-1">
              <GitBranch className="w-[clamp(12px,1.2vw,14px)] h-[clamp(12px,1.2vw,14px)]" />
              Branch
            </span>
            <span className="text-emerald-300 font-medium">{usage.gitBranch}</span>
          </div>
        )}
        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-400 flex items-center gap-1">
            <FileEdit className="w-[clamp(12px,1.2vw,14px)] h-[clamp(12px,1.2vw,14px)]" />
            Files
          </span>
          <span className="text-amber-300 font-medium">{usage.filesModified}</span>
        </div>
      </div>

      {/* Token count */}
      <div className="text-center mb-2 py-1">
        <div className="text-[clamp(24px,3vw,36px)] font-bold text-pink-400">
          {formatTokens(usage.sessionTokens)}
        </div>
        <div className="text-[clamp(10px,1.2vw,12px)] text-slate-400 mt-0.5">
          In <span className="text-slate-300">{formatTokens(usage.sessionInput)}</span> ·
          Out <span className="text-slate-300">{formatTokens(usage.sessionOutput)}</span>
        </div>
      </div>

      {/* Context, Cache */}
      <div className="flex flex-col gap-1.5 text-[clamp(10px,1.2vw,12px)] mb-2">
        <div className="bg-slate-800/50 rounded-lg p-[clamp(6px,0.8vw,10px)] border border-slate-700/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Database className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
              Context
            </span>
            <span className="text-sky-300 font-bold text-[clamp(12px,1.5vw,16px)]">{usage.contextPercent}%</span>
          </div>
          <ProgressBar value={usage.contextPercent} color="bg-sky-400" />
        </div>
        <div className="bg-slate-800/50 rounded-lg p-[clamp(6px,0.8vw,10px)] border border-slate-700/50 flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <Timer className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
            Cache
          </span>
          <span className="text-cyan-300 font-bold text-[clamp(12px,1.5vw,16px)]">
            {usage.cacheRemainingSeconds > 0 ? formatCacheTime(usage.cacheRemainingSeconds) : 'Expired'}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5 text-[clamp(10px,1.2vw,12px)] mb-2">
        <div className="bg-slate-800/50 rounded-lg p-[clamp(6px,0.8vw,10px)] border border-slate-700/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <PieChart className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
              Output Ratio
            </span>
            <span className="text-[clamp(14px,1.8vw,18px)] font-bold text-amber-300">{outputRatio}%</span>
          </div>
          <ProgressBar value={parseFloat(outputRatio)} color="bg-amber-400" />
        </div>
        <div className="bg-slate-800/50 rounded-lg p-[clamp(6px,0.8vw,10px)] border border-slate-700/50 flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <DollarSign className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
            Cost
          </span>
          <span className="text-[clamp(14px,1.8vw,18px)] font-bold text-rose-300">${sessionCost.toFixed(4)}</span>
        </div>
      </div>

      {/* Messages and Duration */}
      <div className="flex justify-between pt-1.5 border-t border-slate-700/50 text-[clamp(10px,1.2vw,12px)]">
        <div className="text-center flex-1">
          <div className="text-slate-500 flex items-center justify-center gap-0.5">
            <MessageSquare className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
            Msgs
          </div>
          <div className="font-bold text-slate-200 text-[clamp(14px,1.8vw,18px)]">{usage.sessionMessages}</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-slate-500 flex items-center justify-center gap-0.5">
            <Clock className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
            Time
          </div>
          <div className="font-bold text-slate-200 text-[clamp(14px,1.8vw,18px)]">{formatDuration(usage.sessionDuration)}</div>
        </div>
      </div>

      {/* Tools */}
      {Object.keys(usage.toolsUsed || {}).length > 0 && (
        <div className="pt-1.5 border-t border-slate-700/50 mt-1.5">
          <div className="text-[clamp(10px,1.2vw,12px)] text-slate-400 mb-1 flex items-center gap-1">
            <Wrench className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
            Tools
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(usage.toolsUsed).slice(0, 6).map(([tool, count]) => (
              <span
                key={tool}
                className="text-[clamp(9px,1vw,11px)] bg-slate-700/50 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600/50"
              >
                {tool} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* System monitoring */}
      <div className="mt-1.5">
        <div className="text-[clamp(10px,1.2vw,12px)] text-violet-300 font-semibold mb-1 flex items-center gap-1">
          <Monitor className="w-[clamp(12px,1.2vw,14px)] h-[clamp(12px,1.2vw,14px)]" />
          <span>System</span>
        </div>

        {/* CPU/MEM/GPU */}
        <div className="flex flex-col gap-1 text-[clamp(9px,1vw,11px)]">
          {/* CPU */}
          <div className="bg-slate-800/50 rounded p-1.5 flex items-center gap-2">
            <span className="text-sky-300 font-medium flex items-center gap-1 w-14">
              <Cpu className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
              CPU
            </span>
            <div className="flex-1">
              <ProgressBar value={system?.cpu || 0} color="bg-sky-400" />
            </div>
            <span className="text-sky-300 font-bold w-12 text-right">{Math.round(system?.cpu || 0)}%</span>
          </div>

          {/* Memory */}
          <div className="bg-slate-800/50 rounded p-1.5 flex items-center gap-2">
            <span className="text-emerald-300 font-medium flex items-center gap-1 w-14">
              <HardDrive className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
              MEM
            </span>
            <div className="flex-1">
              <ProgressBar value={system?.memory || 0} color="bg-emerald-400" />
            </div>
            <span className="text-emerald-300 font-bold w-12 text-right">{Math.round(system?.memory || 0)}%</span>
          </div>

          {/* Network */}
          <div className="flex justify-between items-center text-[clamp(9px,1vw,11px)] mt-1">
            <span className="text-slate-400 flex items-center gap-0.5">
              <Wifi className="w-[clamp(8px,0.8vw,12px)] h-[clamp(8px,0.8vw,12px)]" />
              Net
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-orange-300 font-medium flex items-center gap-0.5">
                <ArrowUp className="w-[clamp(6px,0.6vw,10px)] h-[clamp(6px,0.6vw,10px)]" />
                {formatSpeed(system?.networkUp || 0)}
              </span>
              <span className="text-cyan-300 font-medium flex items-center gap-0.5">
                <ArrowDown className="w-[clamp(6px,0.6vw,10px)] h-[clamp(6px,0.6vw,10px)]" />
                {formatSpeed(system?.networkDown || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
