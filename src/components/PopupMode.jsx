import { AppProvider } from '../contexts/AppContext';
import PopupFloatingPanel from './PopupFloatingPanel';

/**
 * Renders when the app is opened as a popup (?pip=true).
 * This is a fully independent React app instance with its own
 * speech recognition and AI generation.
 */
export default function PopupMode() {
  return (
    <AppProvider>
      <PopupFloatingPanel />
    </AppProvider>
  );
}
