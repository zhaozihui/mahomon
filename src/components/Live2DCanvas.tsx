// Live2D Canvas component - Stable rendering with complex random actions

import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';

// 注册 PIXI 到 window
(window as any).PIXI = PIXI;

interface Live2DCanvasProps {
  width: number;
  height: number;
  expression?: string;
  action?: string | null;
}

// 按钮动作配置 - 匹配按钮含义的大动作
// 模型动作组: Idle (mtn_01), 空 (mtn_02-04, special_01-03)
// mtn_01: 休闲待机
// mtn_02-04: 各种姿势动作
// special_01-03: 魔法棒特效动作（比较大）
const BUTTON_ACTIONS = {
  // 投喂：用 special_02 魔法棒动作，配合开心的表情
  feed: {
    name: 'feed',
    expression: 'exp_02',  // 开心表情
    motion: { group: '', index: 4 },  // special_02 - 魔法棒大动作
  },
  // 玩耍：用 special_03 特效动作，配合调皮表情
  play: {
    name: 'play',
    expression: 'exp_04',  // 活泼表情
    motion: { group: '', index: 5 },  // special_03 - 最大特效动作
  },
  // 休息：用 mtn_02 动作，配合困倦表情（mtn_02 是较安静的动作）
  rest: {
    name: 'rest',
    expression: 'exp_06',  // 困倦表情
    motion: { group: '', index: 0 },  // mtn_02 - 较安静的动作
  },
};

// 复杂动作配置
const COMPLEX_ACTIONS = [
  { name: 'happy', expression: 'exp_02', motion: { group: '', index: 4 } },
  { name: 'thinking', expression: 'exp_05', motion: { group: '', index: 2 } },
  { name: 'greeting', expression: 'exp_02', motion: { group: '', index: 1 } },
  { name: 'magic', expression: 'exp_05', motion: { group: '', index: 3 } },
  { name: 'shy', expression: 'exp_07', motion: { group: '', index: 0 } },
  { name: 'surprise', expression: 'exp_08', motion: { group: '', index: 5 } },
  { name: 'love', expression: 'exp_04', motion: { group: '', index: 3 } },
];

export function Live2DCanvas({
  width,
  height,
  expression,
  action,
}: Live2DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);
  const initRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const currentActionRef = useRef<string | null>(null);

  // 执行复杂动作
  const performComplexAction = useCallback((action: typeof COMPLEX_ACTIONS[0] | typeof BUTTON_ACTIONS[keyof typeof BUTTON_ACTIONS], force: boolean = false) => {
    if (!modelRef.current) {
      console.log('performComplexAction: no model');
      return;
    }
    if (!force && currentActionRef.current === action.name) {
      console.log('performComplexAction: action already running', action.name);
      return;
    }

    console.log('performComplexAction: executing', action.name, 'force:', force);
    currentActionRef.current = action.name;

    try {
      // 设置表情
      if (action.expression) {
        console.log('Setting expression:', action.expression);
        modelRef.current.expression(action.expression);
      }

      // 播放动作
      if (action.motion) {
        console.log('Playing motion:', action.motion.group, action.motion.index);
        modelRef.current.motion(action.motion.group, action.motion.index);
      }

      // 3-5秒后恢复
      setTimeout(() => {
        currentActionRef.current = null;
        console.log('Action completed, resetting');
      }, 3000 + Math.random() * 2000);

    } catch (e) {
      console.warn('Action error:', e);
    }
  }, []);

  // 初始化
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      if (!containerRef.current) return;

      try {
        const app = new PIXI.Application({
          width,
          height,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
        });

        containerRef.current.appendChild(app.view as HTMLCanvasElement);
        appRef.current = app;

        const model = await Live2DModel.from(
          '/assets/live2d/mao_pro.model3.json',
          { autoInteract: false }
        );

        app.stage.addChild(model);

        const scale = Math.min(width / model.width, height / model.height) * 0.9;
        model.scale.set(scale);
        model.x = width / 2;
        model.y = height / 2;
        model.anchor.set(0.5, 0.5);

        modelRef.current = model;
        model.expression('exp_01');
        setIsReady(true);

      } catch (error) {
        console.error('Failed to initialize Live2D:', error);
      }
    };

    init();

    return () => {
      if (modelRef.current) {
        modelRef.current.destroy();
        modelRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      initRef.current = false;
      setIsReady(false);
    };
  }, []);

  // 按钮动作触发 - 强制执行
  useEffect(() => {
    if (!action) return;

    const buttonAction = BUTTON_ACTIONS[action];
    if (!buttonAction) {
      console.log('Unknown action:', action);
      return;
    }

    console.log('Action triggered:', action, 'Model ready:', !!modelRef.current);

    const executeAction = () => {
      if (modelRef.current) {
        console.log('Executing action:', action);
        performComplexAction(buttonAction, true);
        return true;
      }
      return false;
    };

    // 立即尝试执行
    if (!executeAction()) {
      // 模型未准备好，延迟执行
      console.log('Model not ready, waiting...');
      const checkModel = setInterval(() => {
        if (executeAction()) {
          clearInterval(checkModel);
        }
      }, 100);
      // 最多等待 3 秒
      setTimeout(() => clearInterval(checkModel), 3000);
    }
  }, [action, performComplexAction]);

  // 随机动作定时器
  useEffect(() => {
    if (!isReady) return;

    const playRandomAction = () => {
      if (currentActionRef.current) return; // 正在执行动作
      const action = COMPLEX_ACTIONS[Math.floor(Math.random() * COMPLEX_ACTIONS.length)];
      performComplexAction(action);
    };

    // 初始延迟后开始随机动作
    const initialDelay = setTimeout(() => {
      playRandomAction();
    }, 3000);

    // 定时随机动作 (5-15秒间隔)
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% 概率执行
        playRandomAction();
      }
    }, 5000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [isReady, performComplexAction]);

  // 尺寸变化时调整
  useEffect(() => {
    if (appRef.current && modelRef.current) {
      appRef.current.renderer.resize(width, height);
      const scale = Math.min(width / modelRef.current.width, height / modelRef.current.height) * 0.9;
      modelRef.current.scale.set(scale);
      modelRef.current.x = width / 2;
      modelRef.current.y = height / 2;
    }
  }, [width, height]);

  // 表情变化时更新 - 不在动作执行时覆盖
  useEffect(() => {
    if (modelRef.current && expression && !currentActionRef.current) {
      try {
        modelRef.current.expression(expression);
      } catch {
        // 忽略不存在的表情
      }
    }
  }, [expression]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
      className="live2d-canvas"
    />
  );
}