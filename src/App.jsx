import { AppProvider } from './contexts/AppContext';
import FloatingPanel from './components/FloatingPanel';
import PopupMode from './components/PopupMode';
import './App.css';

// Detect if this window is the popup float window
const isPopup = new URLSearchParams(window.location.search).has('pip');

export default function App() {
  if (isPopup) {
    // Render just the floating panel (no background, no hero text)
    return <PopupMode />;
  }

  return (
    <AppProvider>
      {/* Background — simulates being in a video call */}
      <div className="app-bg">
        <div className="bg-grid" />
        <div className="bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="hero-text">
          <h1 className="hero-title">
            <span className="hero-gradient">Interview AI</span>
          </h1>
          <p className="hero-subtitle">
            Your real-time AI interview companion
          </p>
          <div className="hero-features">
            <span>🎙️ Live Speech Recognition</span>
            <span>🤖 AI Answer Generation</span>
            <span>💻 Technical Interview Support</span>
          </div>
          <p className="hero-hint">
            Click <strong>⧉</strong> on the panel to float it over your video call
          </p>
          <p className="hero-shortcut">
            Press <kbd>Ctrl</kbd> + <kbd>H</kbd> to toggle the panel
          </p>
        </div>
      </div>
      <FloatingPanel />
    </AppProvider>
  );
}
