import { useState, useCallback, useId, useRef, type ReactNode } from 'react';
import { UIContext, type Toast } from './UIContext';

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const toastIdSuffix = useId();
  const toastCounter = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = `${toastIdSuffix}-${toastCounter.current++}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 3000);
    },
    [toastIdSuffix, removeToast],
  );

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <UIContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        modalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
