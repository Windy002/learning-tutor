import TopBar from './components/TopBar';
import PhaseBanner from './components/PhaseBanner';
import PhaseSuggestionBanner from './components/PhaseSuggestionBanner';
import MessageList from './components/MessageList';
import InputBox from './components/InputBox';
import SessionSidebar from './components/SessionSidebar';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  useKeyboardShortcuts();

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
