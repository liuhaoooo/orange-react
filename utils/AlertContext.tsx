
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertModal, AlertType } from '../components/AlertModal';

interface AlertOptions {
  message: string;
  title?: string;
  type?: AlertType;
  onClose?: () => void;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, title?: string, onClose?: () => void) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AlertOptions>({ message: '' });

  const showAlert = useCallback((message: string, type: AlertType = 'info', title?: string, onClose?: () => void) => {
    setConfig({ message, type, title, onClose });
    setIsOpen(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsOpen(false);
    if (config.onClose) {
      config.onClose();
    }
  }, [config]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertModal
        isOpen={isOpen}
        onClose={hideAlert}
        message={config.message}
        title={config.title}
        type={config.type}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
