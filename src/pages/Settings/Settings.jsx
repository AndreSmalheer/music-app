import "./Settings.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "../../components/Skeleton/Skeleton";

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}

function SettingsItem({ label, value, hasChevron = true }) {
  return (
    <div className="settings-item">
      <div className="settings-item-label">{label}</div>
      <div className="settings-item-content">
        {value && <span className="settings-item-value">{value}</span>}
        {hasChevron && <ChevronRight />}
      </div>
    </div>
  );
}

function SettingsSection({ title, children }) {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">{title}</h3>
      <div className="settings-section-content">
        {children}
      </div>
    </div>
  );
}

function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="settings-page" style={{ padding: "20px" }}>
        <Skeleton width="150px" height="32px" style={{ marginBottom: "20px" }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ marginBottom: "30px" }}>
            <Skeleton width="100px" height="20px" style={{ marginBottom: "10px" }} />
            {[...Array(3)].map((_, j) => (
              <div key={j} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <Skeleton width="150px" height="20px" />
                <Skeleton width="50px" height="20px" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      <SettingsSection title="Account">
        <SettingsItem label="Profile" value="Driek" />
        <SettingsItem label="Subscription" value="Premium" />
        <SettingsItem label="Email" value="driek@example.com" />
      </SettingsSection>

      <SettingsSection title="Playback">
        <SettingsItem label="Audio Quality" value="High" />
        <SettingsItem label="Equalizer" value="Pop" />
        <SettingsItem label="Crossfade" value="Off" />
        <SettingsItem label="Gapless Playback" value="On" />
      </SettingsSection>

      <SettingsSection title="Storage & Data">
        <SettingsItem label="Download Quality" value="Extreme" />
        <SettingsItem label="Cache Size" value="2.4 GB" />
        <SettingsItem label="Download via Cellular" value="Off" />
      </SettingsSection>

      <SettingsSection title="Appearance">
        <SettingsItem label="Theme" value="Dark" />
        <SettingsItem label="Accent Color" value="Purple" />
        <SettingsItem label="Language" value="English" />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsItem label="Version" value="1.0.4 (Build 42)" hasChevron={false} />
        <SettingsItem label="Privacy Policy" />
        <SettingsItem label="Terms of Service" />
        <SettingsItem label="Open Source Licenses" />
      </SettingsSection>

      <div className="logout-container">
        <button className="btn-logout" onClick={() => navigate("/onboarding")}>
          Log Out
        </button>
      </div>
      
      <div className="settings-footer">
        <p>© 2026 Music App. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Settings;
