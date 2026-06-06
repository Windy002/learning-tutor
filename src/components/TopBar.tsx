import { useStore } from '../store';
import type { Phase } from '../types';

const PHASES: Phase[] = ['摸底测试', '精准补漏', '循环迭代', '全景收网'];

export default function TopBar() {
  const currentBook = useStore((s) => s.currentBook);
  const currentPhase = useStore((s) => s.currentPhase);
  const currentRound = useStore((s) => s.currentRound);
  const setCurrentPhase = useStore((s) => s.setCurrentPhase);

  return (
    <header className="sticky top-0 z-10 bg-page border-b border-border px-5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 bg-brand rounded flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">学</span>
        </div>
        <span className="text-[15px] font-medium text-text-primary">学习导师</span>
        {currentBook && (
          <>
            <span className="text-text-muted text-sm">·</span>
            <span className="text-sm text-text-secondary">{currentBook.title}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-white border border-border rounded-full px-2 py-1">
          <select
            value={currentPhase}
            onChange={(e) => setCurrentPhase(e.target.value as Phase)}
            className="text-xs text-text-secondary bg-transparent border-none outline-none cursor-pointer appearance-none pr-1"
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <span className="text-xs text-text-muted">· 第 {currentRound} 轮</span>
        </div>
      </div>
    </header>
  );
}
