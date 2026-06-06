import { useStore } from '../store';

export default function PhaseBanner() {
  const currentPhase = useStore((s) => s.currentPhase);
  const currentTemplate = useStore((s) => s.currentTemplate);

  const phase = currentTemplate.phases.find(p => p.name === currentPhase);
  const colorClass = phase?.color || 'bg-gray-50 border-gray-200 text-gray-700';

  return (
    <div className={`text-center py-2 text-xs font-medium border-b ${colorClass}`}>
      当前阶段：{currentPhase}
    </div>
  );
}
