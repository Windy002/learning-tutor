import { useEffect, useRef } from 'react';
import TopBar from './components/TopBar';
import PhaseBanner from './components/PhaseBanner';
import PhaseSuggestionBanner from './components/PhaseSuggestionBanner';
import MessageList from './components/MessageList';
import InputBox from './components/InputBox';
import SessionSidebar from './components/SessionSidebar';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useStore } from './store';

function App() {
  useKeyboardShortcuts();

  // Watch store error → toast
  const error = useStore((s) => s.error);
  const showToast = useStore((s) => s.showToast);
  const setError = useStore((s) => s.setError);
  const prevError = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== prevError.current) {
      showToast(error, 'error');
      prevError.current = error;
      // Clear error after showing toast
      setTimeout(() => setError(null), 100);
    }
  }, [error, showToast, setError]);

  return (
    <div className="h-screen flex flex-col bg-page">
      <TopBar />
      <PhaseBanner />
      <PhaseSuggestionBanner />
      <div className="flex-1 flex overflow-hidden">
        <SessionSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <MessageList />
          <InputBox />
        </div>
      </div>
      <SettingsPanel />
      <Toast />
    </div>
  );
}

export default App;
