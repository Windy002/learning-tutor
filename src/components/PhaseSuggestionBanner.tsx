import { useStore } from '../store';
import type { Phase } from '../types';

export default function PhaseSuggestionBanner() {
  const suggestedPhase = useStore((s) => s.suggestedPhase);
  const suggestedPhaseReason = useStore((s) => s.suggestedPhaseReason);
  const clearSuggestion = useStore((s) => s.clearSuggestion);
  const setCurrentPhase = useStore((s) => s.setCurrentPhase);
  const currentTemplate = useStore((s) => s.currentTemplate);

  if (!suggestedPhase) return null;

  const phase = currentTemplate.phases.find(p => p.name === suggestedPhase);
  const colorClass = phase?.color || 'bg-amber-50 border-amber-200 text-amber-700';

  const handleConfirm = () => {
    setCurrentPhase(suggestedPhase as Phase);
    clearSuggestion();
  };

  return (
    <div className={`text-center py-2.5 px-4 text-xs border-b ${colorClass} flex items-center justify-center gap-3`}>
      <span>
        🎯 AI 建议切换到「<strong>{suggestedPhase}</strong>」
        {suggestedPhaseReason && <span className="ml-1 opacity-70">— {suggestedPhaseReason}</span>}
      </span>
      <button
        onClick={handleConfirm}
        className="px-2.5 py-0.5 rounded-full bg-white/60 border border-current font-medium hover:bg-white transition-colors"
      >
        确认切换
      </button>
      <button
        onClick={clearSuggestion}
        className="px-2.5 py-0.5 rounded-full border border-current/30 hover:bg-white/40 transition-colors"
      >
        忽略
      </button>
    </div>
  );
}
