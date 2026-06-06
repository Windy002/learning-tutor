import { useEffect } from 'react';
import { useStore } from '../store';

export default function Toast() {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(clearToast, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-20 right-5 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all animate-[fadeIn_0.2s_ease-out] ${
        toast.type === 'success'
          ? 'bg-green-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      {toast.type === 'success' ? '✅ ' : '❌ '}
      {toast.message}
    </div>
  );
}
