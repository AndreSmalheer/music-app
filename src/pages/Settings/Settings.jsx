import "./Settings.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Skeleton from "../../components/Skeleton/Skeleton";

function SettingsItem({ label, value, hasChevron = false }) {
  return (
    <div className="settings-item">
      <span className="settings-item-label">{label}</span>
      <div className="settings-item-content">
        {value && <span className="settings-item-value">{value}</span>}
        {hasChevron && <ChevronRight size={22} strokeWidth={2} />}
      </div>
    </div>
  );
}

function SettingsToggle({ label, on = false }) {
  return (
    <div className="settings-item">
      <span className="settings-item-label">{label}</span>
      <div className={`settings-toggle ${on ? "is-on" : ""}`}>
        <div className="settings-toggle-knob" />
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
        <button className="settings-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={26} strokeWidth={2.2} />
        </button>
        <h1>Instellingen</h1>
      </div>

      <div className="settings-profile">
        <div className="settings-avatar">A</div>
        <div className="settings-profile-info">
          <div className="settings-profile-name">Adam</div>
          <div className="settings-profile-sub">Bekijk profiel</div>
        </div>
        <ChevronRight size={22} strokeWidth={2} className="settings-profile-chevron" />
      </div>

      <SettingsSection title="Weergave">
        <SettingsItem label="Thema" value="Donker" />
      </SettingsSection>

      <SettingsSection title="Afspelen">
        <SettingsItem label="Audiokwaliteit" value="Hoog" />
        <SettingsToggle label="Crossfade" on={true} />
        <SettingsToggle label="Alleen downloaden via wifi" on={false} />
        <SettingsItem label="Equalizer" hasChevron={true} />
      </SettingsSection>

      <div className="logout-container">
        <button className="btn-logout" onClick={() => navigate("/onboarding")}>
          Log Out
        </button>
      </div>

      <div className="settings-footer">
        <p>Muziekspeler &middot; versie 1.0.0</p>
      </div>
    </div>
  );
}

export default Settings;
