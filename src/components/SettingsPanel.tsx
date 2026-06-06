import { useStore } from '../store';

export default function SettingsPanel() {
  const isOpen = useStore((s) => s.isSettingsOpen);
  const toggleSettings = useStore((s) => s.toggleSettings);
  const apiKey = useStore((s) => s.apiKey);
  const apiBase = useStore((s) => s.apiBase);
  const model = useStore((s) => s.model);
  const setApiKey = useStore((s) => s.setApiKey);
  const setApiBase = useStore((s) => s.setApiBase);
  const setModel = useStore((s) => s.setModel);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={toggleSettings}>
      <div
        className="bg-white rounded-xl shadow-xl w-[380px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">⚙️ 设置</h3>
          <button onClick={toggleSettings} className="text-text-muted hover:text-text-primary text-lg leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-brand"
            />
            <p className="text-[11px] text-text-muted mt-1">不会被上传到服务器，仅存在本地浏览器</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">API Base URL</label>
            <input
              type="text"
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              placeholder="https://api.deepseek.com"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">模型</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full text-sm text-text-primary bg-page border border-border rounded-lg px-3 py-2 outline-none"
            >
              <option value="deepseek-chat">DeepSeek Chat</option>
              <option value="deepseek-reasoner">DeepSeek Reasoner</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
              <option value="claude-opus-4-8">Claude Opus 4.8</option>
              <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4.1">GPT-4.1</option>
            </select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>提示：</strong>如果使用 Anthropic (Claude) API，API Base 填 <code className="bg-amber-100 px-1 rounded">https://api.anthropic.com</code>。
              使用 OpenAI 则填 <code className="bg-amber-100 px-1 rounded">https://api.openai.com</code>。
            </p>
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
