// Control Buttons - 喂食/玩耍/休息

import { usePetStore } from '../stores/petStore';
import { ActionType } from '../lib/pet';

export function ControlButtons() {
  const interact = usePetStore((s) => s.interact);

  const handleAction = (action: ActionType) => {
    const result = interact(action);
    if (result.success) {
      console.log(result.message);
    } else {
      console.warn(result.message);
    }
  };

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 text-white w-full">
      <div className="text-sm text-purple-400 font-bold mb-3 flex items-center gap-2">
        <span>🎮</span>
        <span>互动</span>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleAction(ActionType.FEED)}
          className="flex flex-col items-center gap-1 w-16 h-16 rounded-xl bg-orange-500/80 hover:bg-orange-400 active:bg-orange-600 text-white transition-colors touch-manipulation"
          title="喂食"
        >
          <span className="text-2xl">🍖</span>
          <span className="text-xs">喂食</span>
        </button>
        <button
          onClick={() => handleAction(ActionType.PLAY)}
          className="flex flex-col items-center gap-1 w-16 h-16 rounded-xl bg-pink-500/80 hover:bg-pink-400 active:bg-pink-600 text-white transition-colors touch-manipulation"
          title="玩耍"
        >
          <span className="text-2xl">🎮</span>
          <span className="text-xs">玩耍</span>
        </button>
        <button
          onClick={() => handleAction(ActionType.REST)}
          className="flex flex-col items-center gap-1 w-16 h-16 rounded-xl bg-purple-500/80 hover:bg-purple-400 active:bg-purple-600 text-white transition-colors touch-manipulation"
          title="休息"
        >
          <span className="text-2xl">💤</span>
          <span className="text-xs">休息</span>
        </button>
      </div>
    </div>
  );
}