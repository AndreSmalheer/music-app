import "./OptionsMenu.css";

function OptionsMenu({ isOpen, onClose, options, onOptionClick }) {
  if (!isOpen) return null;

  return (
    <div className="options-overlay" onClick={onClose}>
      <div className="options-menu" onClick={(e) => e.stopPropagation()}>
        <div className="options-menu-header">
          <div className="options-menu-handle"></div>
        </div>
        <div className="options-list">
          {options.map((option) => (
            <button
              key={option}
              className="options-item"
              onClick={() => {
                onOptionClick?.(option);
                onClose();
              }}
            >
              {option}
            </button>
          ))}
          <button
            className="options-item options-item--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default OptionsMenu;
