import "./EmptyState.css";

const Icons = {
  artist: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  ),
  playlist: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="12" x2="15" y2="12"></line>
    </svg>
  ),
  song: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  ),
};

function EmptyState({ title, subtitle, iconKey, minimal = false, alignLeft = false, iconLeft = false }) {
  const icon = Icons[iconKey];

  if (minimal) {
    return (
      <div className={`empty-state empty-state--minimal ${alignLeft ? 'empty-state--left' : ''}`}>
        {icon && <div className="empty-state__icon">{icon}</div>}
      </div>
    );
  }

  return (
    <div className={`empty-state ${alignLeft ? 'empty-state--left' : ''} ${iconLeft ? 'empty-state--icon-left' : ''}`}>
      {icon && <div className="empty-state__icon">{icon}</div>}
      <div className="empty-state__content">
        <h3 className="empty-state__title">{title}</h3>
        {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

export default EmptyState;
