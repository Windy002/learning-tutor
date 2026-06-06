import type { Verdict } from '../types';

interface Props {
  verdict: Verdict;
}

const LABELS: Record<Verdict, string> = {
  correct: '判断: 正确',
  partial: '判断: 部分正确',
  wrong: '判断: 偏差',
};

const COLORS: Record<Verdict, string> = {
  correct: 'bg-green-50 text-verdict-correct border-green-200',
  partial: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  wrong: 'bg-red-50 text-verdict-wrong border-red-200',
};

export default function VerdictBadge({ verdict }: Props) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${COLORS[verdict]}`}>
      {LABELS[verdict]}
    </span>
  );
}
