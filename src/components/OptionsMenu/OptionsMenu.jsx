import { motion, AnimatePresence } from "framer-motion";
import "./OptionsMenu.css";

function OptionsMenu({ isOpen, onClose, options, onOptionClick }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="options-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="options-menu"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(event, info) => {
              if (info.offset.y > 100) onClose();
            }}
          >
            <div className="options-menu-header">
              <div className="options-menu-handle"></div>
            </div>
            <div className="options-list">
              {options.map((option) => {
                const Icon = option.icon;

                return (
                  <button
                    key={option.label}
                    className="options-item"
                    onClick={() => {
                      onOptionClick(option);
                      onClose();
                    }}
                  >
                    {Icon && <Icon size={20} />}
                    <span>{option.label}</span>
                  </button>
                );
              })}
              <button
                className="options-item options-item--cancel"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OptionsMenu;
