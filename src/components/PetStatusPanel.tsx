// Pet Status Panel - 显示 HP/Mood/Hunger/EXP

import { usePetState } from '../stores/petStore';
import { usePetStore } from '../stores/petStore';

interface AttrBarProps {
  label: string;
  icon: string;
  value: number;
  max: number;
  color: string;
  bgColor: string;
}

function AttrBar({ label, icon, value, max, color, bgColor }: AttrBarProps) {
  const percent = Math.floor((value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-14 flex items-center gap-1 shrink-0">
        <span>{icon}</span>
        <span className="hidden xs:inline">{label}</span>
      </span>
      <div className={`flex-1 h-2 rounded-full ${bgColor} overflow-hidden`}>
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={`w-8 text-right font-bold text-xs ${color.replace('bg-', 'text-')}`}>
        {Math.round(value)}
      </span>
    </div>
  );
}

export function PetStatusPanel() {
  const state = usePetState();
  const pet = usePetStore((s) => s.pet);

  const expForNext = pet.getExpForNextLevel();
  const expPercent = expForNext > 0 ? Math.floor((state.exp / expForNext) * 100) : 0;

  return (
    <div className="bg-black/70 backdrop-blur-sm rounded-xl p-3 text-white w-full">
      {/* 名称和等级 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">{pet.getIcon()}</span>
          <span className="font-bold text-sm md:text-base">{state.name}</span>
        </div>
        <span className="text-xs md:text-sm text-purple-400 font-bold">
          Lv.{state.level} {pet.getLevelTitle()}
        </span>
      </div>

      {/* 属性条 */}
      <div className="space-y-1.5 md:space-y-2">
        <AttrBar
          label="体力"
          icon="❤️"
          value={state.hp}
          max={100}
          color="bg-pink-500"
          bgColor="bg-pink-900/30"
        />
        <AttrBar
          label="快乐"
          icon="😊"
          value={state.mood}
          max={100}
          color="bg-orange-500"
          bgColor="bg-orange-900/30"
        />
        <AttrBar
          label="饱食"
          icon="🍖"
          value={state.hunger}
          max={100}
          color="bg-green-500"
          bgColor="bg-green-900/30"
        />
      </div>

      {/* EXP */}
      <div className="flex items-center gap-2 text-xs md:text-sm mt-2">
        <span>⭐EXP</span>
        <div className="flex-1 h-2 rounded-full bg-purple-900/30 overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${expPercent}%` }}
          />
        </div>
        <span className="text-purple-400 font-bold text-xs">
          {state.exp}/{expForNext}
        </span>
      </div>

      {/* 状态文本 */}
      <div className="text-center text-xs text-gray-400 mt-2 truncate">
        {pet.getStatusText()}
      </div>
    </div>
  );
}
