// Main App component - Two-column layout with Live2D at bottom-right

import { useEffect, useState, useCallback, useRef } from 'react';
import { Live2DCanvas } from './components/Live2DCanvas';
import { SessionBubble } from './components/SessionBubble';
import { StatsPanel } from './components/StatsPanel';
import { usePetStore } from './stores/petStore';
import { useUsageStore } from './stores/usageStore';
import { Utensils, Gamepad2, Bed } from 'lucide-react';

// Live2D 表情映射
const EXPRESSION_MAP: Record<string, string> = {
  happy: 'exp_02',
  working: 'exp_05',
  eating: 'exp_03',
  playing: 'exp_04',
  tired: 'exp_06',
  hungry: 'exp_07',
  intense: 'exp_05',
  level_up: 'exp_02',
  normal: 'exp_01',
};

const API_BASE = `http://${window.location.hostname}:3001/api`;

function App() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Live2D 动作触发
  const [live2dAction, setLive2dAction] = useState<string | null>(null);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAction = useCallback((action: string) => {
    setLive2dAction(action);
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
    }
    actionTimeoutRef.current = setTimeout(() => {
      setLive2dAction(null);
    }, 4000);
  }, []);

  const pet = usePetStore((s) => s.pet);
  const { setUsageData, setSystemData } = useUsageStore();
  const { loadState, tick, updateFromUsage, getState } = usePetStore();

  // 使用 ref 避免依赖循环
  const stateRef = useRef(getState());
  stateRef.current = getState();

  // 响应窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 获取 Live2D 表情
  const expressionState = pet.getLastExpressionState();
  const stateKey = pet.getCurrentStateKey();
  const expression = EXPRESSION_MAP[expressionState] || EXPRESSION_MAP[stateKey] || 'exp_01';

  // 加载宠物数据（只执行一次）
  useEffect(() => {
    const loadPetData = async () => {
      try {
        const res = await fetch(`${API_BASE}/pet`);
        const data = await res.json();
        loadState(data);
      } catch (error) {
        console.error('Failed to load pet data:', error);
      }
    };

    loadPetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 数据获取函数
  const fetchData = useCallback(async () => {
    try {
      const [usageRes, sysRes] = await Promise.all([
        fetch(`${API_BASE}/usage`),
        fetch(`${API_BASE}/system`),
      ]);

      const usageData = await usageRes.json();
      const sysData = await sysRes.json();

      setUsageData(usageData);
      setSystemData(sysData);

      if (usageData.totalTokens > 0) {
        updateFromUsage(
          usageData.totalTokens,
          usageData.sessionInput,
          usageData.sessionOutput
        );

        // 使用 ref 获取最新状态
        await fetch(`${API_BASE}/pet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stateRef.current),
        });
      }

      tick();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, [setUsageData, setSystemData, updateFromUsage, tick]);

  // 数据轮询 - 每 3 秒刷新
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900/80 to-purple-900/40 overflow-hidden flex flex-col">
      {/* 头部 */}
      <header className="flex items-center gap-2 px-4 py-2 bg-black/40 border-b border-purple-500/20">
        <img src="/icon.png" alt="Maho-Mon" className="w-8 h-8 rounded-lg shadow-lg shadow-purple-500/30" />
        <h1 className="text-lg font-bold text-pink-400">
          Maho-Mon
        </h1>
        <span className="text-xs text-purple-300/60 ml-1">Magic Monitor Girl</span>
      </header>

      {/* 主内容 */}
      <div className="flex-1 flex flex-row gap-1.5 p-1.5 box-border overflow-hidden">
        {/* 左侧 - 当前会话（含系统监控） */}
        <div className="flex flex-col flex-1 min-w-0 gap-1.5">
          <div className="rounded-lg overflow-hidden h-full">
            <SessionBubble />
          </div>
        </div>

        {/* 右侧 - 累计统计 + Live2D */}
        <div className="flex flex-col flex-1 min-w-0 gap-1.5">
          {/* 累计统计 - 40% */}
          <div className="rounded-lg overflow-hidden" style={{ height: '40%' }}>
            <StatsPanel />
          </div>
          {/* Live2D + 按钮 - 60% */}
          <div className="rounded-lg overflow-hidden flex flex-col bg-black/30" style={{ height: '60%' }}>
            {/* 控制按钮 - 在 Live2D 上面 */}
            <div className="flex justify-center items-center gap-[clamp(6px,0.8vw,10px)] py-[clamp(8px,0.8vh,12px)] px-2 bg-slate-900/50">
              <button
                onClick={() => triggerAction('feed')}
                className="flex items-center justify-center gap-1 min-w-[clamp(80px,10vw,120px)] px-4 py-2 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:via-orange-400 hover:to-red-400 text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-[0_4px_15px_rgba(251,146,60,0.4)] hover:shadow-[0_6px_20px_rgba(251,146,60,0.6)] hover:-translate-y-0.5 active:translate-y-0 border border-orange-300/20 whitespace-nowrap"
              >
                <Utensils className="w-5 h-5" />
                <span>Feed</span>
              </button>
              <button
                onClick={() => triggerAction('play')}
                className="flex items-center justify-center gap-1 min-w-[clamp(80px,10vw,120px)] px-4 py-2 bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-500 hover:from-pink-300 hover:via-rose-400 hover:to-fuchsia-400 text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-[0_4px_15px_rgba(244,63,94,0.4)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.6)] hover:-translate-y-0.5 active:translate-y-0 border border-pink-300/20 whitespace-nowrap"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Play</span>
              </button>
              <button
                onClick={() => triggerAction('rest')}
                className="flex items-center justify-center gap-1 min-w-[clamp(80px,10vw,120px)] px-4 py-2 bg-gradient-to-br from-indigo-400 via-purple-500 to-violet-600 hover:from-indigo-300 hover:via-purple-400 hover:to-violet-500 text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 active:translate-y-0 border border-indigo-300/20 whitespace-nowrap"
              >
                <Bed className="w-5 h-5" />
                <span>Rest</span>
              </button>
            </div>
            {/* Live2D */}
            <div className="flex items-center justify-center flex-1">
              <Live2DCanvas
                width={windowSize.width * 0.50}
                height={windowSize.height * 0.60 - 40}
                expression={expression}
                action={live2dAction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;