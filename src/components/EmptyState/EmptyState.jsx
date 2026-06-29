import "./EmptyState.css";
import { Mic2, ListMusic, Music } from "lucide-react";

const Icons = {
  artist: <Mic2 size={40} strokeWidth={1.5} />,
  playlist: <ListMusic size={40} strokeWidth={1.5} />,
  song: <Music size={40} strokeWidth={1.5} />,
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
