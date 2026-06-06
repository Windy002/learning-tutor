import { useMemo } from 'react';
import { useStore } from '../store';

const ALL_MODELS: { provider: string; pattern: RegExp; models: string[] }[] = [
  {
    provider: 'DeepSeek',
    pattern: /deepseek/,
    models: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-v3.2', 'deepseek-r1'],
  },
  {
    provider: 'Anthropic (Claude)',
    pattern: /anthropic/,
    models: [
      'claude-opus-4-8',
      'claude-opus-4-7',
      'claude-sonnet-4-6',
      'claude-sonnet-4-5',
      'claude-haiku-4-5-20251001',
    ],
  },
  {
    provider: 'OpenAI',
    pattern: /openai/,
    models: [
      'gpt-5',
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'o3',
      'o3-pro',
      'o4-mini',
    ],
  },
];

function detectProvider(apiBase: string): string | null {
  if (!apiBase.trim()) return null;
  for (const p of ALL_MODELS) {
    if (p.pattern.test(apiBase)) return p.provider;
  }
  return null;
}

function getModelSuggestions(apiBase: string): string[] {
  for (const p of ALL_MODELS) {
    if (p.pattern.test(apiBase)) return p.models;
  }
  return ALL_MODELS.flatMap(p => p.models);
}

export default function SettingsPanel() {
  const isOpen = useStore((s) => s.isSettingsOpen);
  const toggleSettings = useStore((s) => s.toggleSettings);
  const apiKey = useStore((s) => s.apiKey);
  const apiBase = useStore((s) => s.apiBase);
  const model = useStore((s) => s.model);
  const setApiKey = useStore((s) => s.setApiKey);
  const setApiBase = useStore((s) => s.setApiBase);
  const setModel = useStore((s) => s.setModel);

  const provider = useMemo(() => detectProvider(apiBase), [apiBase]);
  const suggestions = useMemo(() => getModelSuggestions(apiBase), [apiBase]);

  if (!isOpen) return null;

  const handleApiBaseChange = (value: string) => {
    setApiBase(value);
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={toggleSettings}>
      <div
        className="bg-white rounded-xl shadow-xl w-[400px] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">⚙️ 设置</h3>
          <button onClick={toggleSettings} className="text-text-muted hover:text-text-primary text-lg leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">API Base URL</label>
            <input
              type="text"
              value={apiBase}
              onChange={(e) => handleApiBaseChange(e.target.value)}
              placeholder="https://api.deepseek.com"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-brand"
            />
            {provider && (
              <p className="text-[11px] text-green-600 mt-1">
                ✓ 识别为 {provider}
              </p>
            )}
            {!provider && apiBase.trim() && (
              <p className="text-[11px] text-amber-600 mt-1">
                ⚠ 未识别，请手动输入模型名
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">模型</label>
            {provider ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-sm text-text-primary bg-page border border-border rounded-lg px-3 py-2 outline-none"
              >
                {suggestions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
                {!suggestions.includes(model) && (
                  <option value={model}>{model}</option>
                )}
              </select>
            ) : (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="输入模型名..."
                className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-brand"
              />
            )}
            <p className="text-[11px] text-text-muted mt-1">
              {provider ? '该提供商的活跃模型' : '手动输入模型名'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-brand"
            />
            <p className="text-[11px] text-text-muted mt-1">仅存在浏览器本地，不会上传到服务器</p>
          </div>

          <div className="bg-page border border-border rounded-lg p-3 space-y-1.5">
            <p className="text-xs text-text-secondary font-medium">预设 API Base：</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_MODELS.map(p => (
                <button
                  key={p.provider}
                  onClick={() => handleApiBaseChange(
                    p.provider.includes('DeepSeek') ? 'https://api.deepseek.com' :
                    p.provider.includes('OpenAI') ? 'https://api.openai.com' :
                    'https://api.anthropic.com'
                  )}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    provider === p.provider
                      ? 'bg-brand/10 border-brand text-brand'
                      : 'bg-white border-border text-text-secondary hover:border-text-muted'
                  }`}
                >
                  {p.provider}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border flex justify-end">
          <button
            onClick={toggleSettings}
            className="text-xs bg-brand text-white rounded-lg px-4 py-1.5 hover:bg-orange-700"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
