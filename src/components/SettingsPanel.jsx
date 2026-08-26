import { X } from "lucide-react";

function SettingsPanel({ onClose, theme, onThemeChange, enterToSend, onEnterToSendChange }) {
  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>Settings</h2>

          <button type="button" className="settings-close" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <h3>Appearance</h3>

            <div className="settings-row">
              <div>
                <span className="settings-label">Theme</span>

                <span className="settings-description">Choose how AIVerse looks.</span>
              </div>

              <select className="theme-select" value={theme} onChange={(e) => onThemeChange(e.target.value)}>
                <option value="system">System</option>

                <option value="light">Light</option>

                <option value="dark">Dark</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h3>Chat</h3>

            <div className="settings-row">
              <div>
                <span className="settings-label">Enter to send</span>

                <span className="settings-description">Press Enter to send messages.</span>
              </div>

              <input type="checkbox" checked={enterToSend}
                onChange={(e) => onEnterToSendChange(e.target.checked)}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;