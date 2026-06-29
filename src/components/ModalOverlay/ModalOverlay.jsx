import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import "./ModalOverlay.css";
// Importing original styles for reuse
import "../ConfirmModal/ConfirmModal.css";
import "../OptionsMenu/OptionsMenu.css";

function ModalOverlay({ isOpen, onClose, type, data }) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputValue(data.defaultValue || "");
    }
  }, [isOpen, data.defaultValue]);

  if (!isOpen) return null;

  const handleStopPropagation = (e) => e.stopPropagation();

  const modalContent = (
    <AnimatePresence>
      <motion.div
        className={type === "confirm" || type === "input" ? "confirm-overlay" : "options-overlay"}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={type === "confirm" || type === "input" ? "confirm-modal" : "options-menu"}
          onClick={handleStopPropagation}
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
          {type === "confirm" ? (
            <>
              <div className="confirm-header">
                <div className="confirm-handle"></div>
                <h2 className="confirm-title">Are you sure?</h2>
              </div>
              <p className="confirm-message">{data.message}</p>
              <div className="confirm-actions">
                <button className="confirm-btn confirm-btn--yes" onClick={() => { data.onConfirm(); onClose(); }}>
                  Delete
                </button>
                <button className="confirm-btn confirm-btn--no" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </>
          ) : type === "input" ? (
            <>
              <div className="confirm-header">
                <div className="confirm-handle"></div>
                <h2 className="confirm-title">{data.title}</h2>
              </div>
              <input
                className="input-field"
                type="text"
                placeholder={data.placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className="confirm-actions">
                <button className="confirm-btn confirm-btn--yes" onClick={() => { data.onSave(inputValue); onClose(); }}>
                  Save
                </button>
                <button className="confirm-btn confirm-btn--no" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="options-menu-header">
                <div className="options-menu-handle"></div>
              </div>
              <div className="options-list">
                {data.options.map((option) => {
                  const optionLabel =
                    typeof option === "string" ? option : option.label;
                  const optionKey =
                    typeof option === "string" ? option : option.id || option.label;

                  return (
                  <button
                    key={optionKey}
                    className="options-item"
                    onClick={() => {
                      data.onOptionClick?.(option);
                      onClose();
                    }}
                  >
                    {optionLabel}
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
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default ModalOverlay;
