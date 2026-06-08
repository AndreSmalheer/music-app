import { createContext, useState, useContext } from "react";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";

export const ConfirmModalContext = createContext();

export function ConfirmModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = (message, onConfirm) => {
    setModalState({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        hideConfirm();
      },
    });
  };

  const hideConfirm = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  return (
    <ConfirmModalContext.Provider value={{ showConfirm, hideConfirm }}>
      {children}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={hideConfirm}
        onConfirm={modalState.onConfirm}
        message={modalState.message}
      />
    </ConfirmModalContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmModalContext);
