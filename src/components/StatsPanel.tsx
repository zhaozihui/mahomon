// Stats Panel - Total cumulative statistics

import { useUsageData } from '../stores/usageStore';
import { formatTokens } from '../types/usage';
import { TrendingUp, ArrowDownToLine, ArrowUpFromLine, Percent, Layers, MessageSquare, Coins, BarChart2 } from 'lucide-react';

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

export function StatsPanel() {
  const usage = useUsageData();

  if (!usage) {
    return (
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 text-white w-full h-full flex items-center justify-center">
        <div className="text-[clamp(12px,1.5vw,14px)] text-gray-400">Loading...</div>
      </div>
    );
  }

  const outputRatio = usage.inputTokens + usage.outputTokens > 0
    ? ((usage.outputTokens / (usage.inputTokens + usage.outputTokens)) * 100).toFixed(1)
    : '0';

  const avgTokensPerSession = usage.totalSessions > 0
    ? Math.round((usage.inputTokens + usage.outputTokens) / usage.totalSessions)
    : 0;
  const avgMessagesPerSession = usage.totalSessions > 0
    ? Math.round(usage.totalMessages / usage.totalSessions)
    : 0;

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-[clamp(8px,1vw,12px)] text-white w-full h-full flex flex-col">
      <div className="text-[clamp(12px,1.5vw,14px)] text-violet-300 font-semibold mb-1.5 flex items-center gap-1.5">
        <TrendingUp className="w-[clamp(14px,1.5vw,18px)] h-[clamp(14px,1.5vw,18px)]" />
        <span>Total Stats</span>
      </div>

      {/* Version */}
      {usage.version && (
        <div className="text-center mb-1.5">
          <span className="text-[clamp(9px,1vw,11px)] text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full border border-slate-600/50">
            v{usage.version}
          </span>
        </div>
      )}

      {/* Total Token + Cost */}
      <div className="text-center mb-2">
        <div className="text-[clamp(24px,3vw,36px)] font-bold text-pink-400">
          {formatTokens(usage.totalTokens)}
        </div>
        <div className="text-[clamp(10px,1.2vw,12px)] text-slate-400 flex items-center justify-center gap-1">
          <BarChart2 className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
          Total Tokens
        </div>
        <div className="text-[clamp(14px,1.8vw,18px)] font-bold text-rose-300 mt-0.5 flex items-center justify-center gap-1">
          <Coins className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
          ${usage.cost.toFixed(2)}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5 text-[clamp(10px,1.2vw,12px)] mb-2">
        <div className="bg-slate-800/50 rounded-lg p-[clamp(6px,0.8vw,10px)] border border-slate-700/50 flex justify-between items-center">
          <div className="text-slate-400 flex items-center gap-1">
            <ArrowDownToLine className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
            Input
          </div>
          <div className="text-[clamp(14px,1.8vw,18px)] font-bold text-sky-300">{formatTokens(usage.inputTokens)}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-[clamp(6px,0.8vw,10px)] border border-slate-700/50 flex justify-between items-center">
          <div className="text-slate-400 flex items-center gap-1">
            <ArrowUpFromLine className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
            Output
          </div>
          <div className="text-[clamp(14px,1.8vw,18px)] font-bold text-emerald-300">{formatTokens(usage.outputTokens)}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-[clamp(6px,0.8vw,10px)] border border-slate-700/50">
          <div className="flex justify-between items-center mb-1">
            <div className="text-slate-400 flex items-center gap-1">
              <Percent className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
              Output Ratio
            </div>
            <div className="text-[clamp(14px,1.8vw,18px)] font-bold text-amber-300">{outputRatio}%</div>
          </div>
          <ProgressBar value={parseFloat(outputRatio)} color="bg-amber-400" />
        </div>
        <div className="bg-slate-800/50 rounded-lg p-[clamp(6px,0.8vw,10px)] border border-slate-700/50 flex justify-between items-center">
          <div className="text-slate-400 flex items-center gap-1">
            <Layers className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
            Sessions
          </div>
          <div className="text-[clamp(14px,1.8vw,18px)] font-bold text-violet-300">{usage.totalSessions}</div>
        </div>
      </div>

      {/* Average data */}
      <div className="pt-1.5 border-t border-slate-700/50 flex justify-between text-[clamp(10px,1.2vw,12px)] mt-auto">
        <div className="text-center flex-1">
          <div className="text-slate-500">Per Session</div>
          <div className="font-bold text-slate-200 text-[clamp(12px,1.5vw,16px)]">{formatTokens(avgTokensPerSession)} T</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-slate-500 flex items-center justify-center gap-0.5">
            <MessageSquare className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
            Per Session
          </div>
          <div className="font-bold text-slate-200 text-[clamp(12px,1.5vw,16px)]">{avgMessagesPerSession}</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-slate-500">Total Msgs</div>
          <div className="font-bold text-slate-200 text-[clamp(12px,1.5vw,16px)]">{usage.totalMessages}</div>
        </div>
      </div>
    </div>
  );
}
