import { useStore } from '../store';
import type { Phase } from '../types';

const BANNER_COLORS: Record<Phase, string> = {
  '摸底测试': 'bg-blue-50 border-blue-200 text-blue-700',
  '精准补漏': 'bg-amber-50 border-amber-200 text-amber-700',
  '循环迭代': 'bg-purple-50 border-purple-200 text-purple-700',
  '全景收网': 'bg-green-50 border-green-200 text-green-700',
};

export default function PhaseBanner() {
  const currentPhase = useStore((s) => s.currentPhase);

  return (
    <div className={`text-center py-2 text-xs font-medium border-b ${BANNER_COLORS[currentPhase]}`}>
      当前阶段：{currentPhase}
    </div>
  );
}
