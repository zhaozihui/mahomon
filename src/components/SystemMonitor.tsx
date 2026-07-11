// System Monitor - CPU/Memory/GPU/Network

import { useSystemData } from '../stores/usageStore';
import { formatSpeed } from '../types/usage';
import { Monitor, Cpu, HardDrive, Cpu as GpuIcon, Wifi, ArrowUp, ArrowDown } from 'lucide-react';

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
    <div className="h-[clamp(6px,0.6vw,10px)] rounded-full bg-slate-700/80 overflow-hidden">
      <div
        className={`h-full ${getColor(value)} transition-all duration-300 rounded-full`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export function SystemMonitor() {
  const system = useSystemData();

  if (!system) {
    return (
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 text-white w-full h-full flex items-center justify-center">
        <div className="text-[clamp(12px,1.5vw,14px)] text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-[clamp(8px,1vw,12px)] text-white w-full h-full flex flex-col">
      <div className="text-[clamp(12px,1.5vw,14px)] text-violet-300 font-semibold mb-2 flex items-center gap-1.5">
        <Monitor className="w-[clamp(14px,1.5vw,18px)] h-[clamp(14px,1.5vw,18px)]" />
        <span>系统监控</span>
      </div>

      {/* CPU/MEM/GPU 网格 */}
      <div className="grid grid-cols-3 gap-[clamp(6px,0.8vw,12px)] text-[clamp(10px,1.2vw,12px)] mb-2">
        {/* CPU */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sky-300 font-medium flex items-center gap-1">
              <Cpu className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
              CPU
            </span>
            <span className="text-sky-300 font-bold">{Math.round(system.cpu)}%</span>
          </div>
          <ProgressBar value={system.cpu} color="bg-sky-400" />
        </div>

        {/* 内存 */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-emerald-300 font-medium flex items-center gap-1">
              <HardDrive className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
              MEM
            </span>
            <span className="text-emerald-300 font-bold">{Math.round(system.memory)}%</span>
          </div>
          <ProgressBar value={system.memory} color="bg-emerald-400" />
        </div>

        {/* GPU */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-purple-300 font-medium flex items-center gap-1">
              <GpuIcon className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
              GPU
            </span>
            <span className="text-purple-300 font-bold">{Math.round(system.gpuUsage || 0)}%</span>
          </div>
          <ProgressBar value={system.gpuUsage || 0} color="bg-purple-400" />
        </div>
      </div>

      {/* 网络 - 单独一行 */}
      <div className="bg-slate-800/50 rounded-lg p-[clamp(6px,0.8vw,10px)] border border-slate-700/50 mt-auto">
        <div className="flex justify-between items-center text-[clamp(10px,1.2vw,12px)] whitespace-nowrap">
          <span className="text-slate-400 flex items-center gap-1">
            <Wifi className="w-[clamp(10px,1vw,14px)] h-[clamp(10px,1vw,14px)]" />
            网络
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-orange-300 font-medium flex items-center gap-0.5">
              <ArrowUp className="w-[clamp(8px,0.8vw,12px)] h-[clamp(8px,0.8vw,12px)]" />
              {formatSpeed(system.networkUp)}
            </span>
            <span className="text-cyan-300 font-medium flex items-center gap-0.5">
              <ArrowDown className="w-[clamp(8px,0.8vw,12px)] h-[clamp(8px,0.8vw,12px)]" />
              {formatSpeed(system.networkDown)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
