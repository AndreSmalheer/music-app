import { motion, AnimatePresence } from "framer-motion";
import "./ConfirmModal.css";

function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="confirm-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="confirm-modal"
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
            <div className="confirm-header">
              <div className="confirm-handle"></div>
              <h2 className="confirm-title">Are you sure?</h2>
            </div>
            <p className="confirm-message">{message}</p>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn--yes" onClick={onConfirm}>
                Delete
              </button>
              <button className="confirm-btn confirm-btn--no" onClick={onClose}>
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;
