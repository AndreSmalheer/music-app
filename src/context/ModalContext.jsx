import { createContext, useState, useContext } from "react";
import ModalOverlay from "../components/ModalOverlay/ModalOverlay";

export const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: {},
  });

  const showConfirm = (message, onConfirm) => {
    setModalState({
      isOpen: true,
      type: "confirm",
      data: { message, onConfirm },
    });
  };

  const showInput = (title, placeholder, onSave) => {
    setModalState({
      isOpen: true,
      type: "input",
      data: { title, placeholder, onSave },
    });
  };

  const showOptions = (options, onOptionClick) => {
    setModalState({
      isOpen: true,
      type: "options",
      data: { options, onOptionClick },
    });
  };

  const hideModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ showConfirm, showInput, showOptions, hideModal }}>
      {children}
      <ModalOverlay
        isOpen={modalState.isOpen}
        onClose={hideModal}
        type={modalState.type}
        data={modalState.data}
      />
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
