import React, { createContext, useState, useContext } from 'react';
import Notification from '../components/common/Notification';

// Create context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    duration: 4000
  });

  const showNotification = ({ message, type = 'success', duration = 4000 }) => {
    // Handle multiline messages
    const formattedMessage = Array.isArray(message) ? message.join('\n') : message;
    setNotification({ message: formattedMessage, type, duration });
  };

  const clearNotification = () => {
    setNotification({ ...notification, message: '' });
  };

  // Enhanced notification methods with better error handling
  const showSuccess = (message, duration = 4000) => {
    showNotification({ message, type: 'success', duration });
  };

  const showError = (error, duration = 6000) => {
    let message = error;
    
    // Handle API errors
    if (error?.response) {
      message = error.userMessage || error.response.data?.message || 'Ocorreu um erro inesperado';
    } else if (typeof error === 'object') {
      message = error.message || 'Ocorreu um erro inesperado';
    }

    showNotification({ message, type: 'error', duration });
  };

  const showWarning = (message, duration = 5000) => {
    showNotification({ message, type: 'warning', duration });
  };

  const showInfo = (message, duration = 4000) => {
    showNotification({ message, type: 'info', duration });
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        showNotification,
        clearNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
      }}
    >
      {children}
      <Notification 
        message={notification.message}
        type={notification.type}
        duration={notification.duration}
        onClose={clearNotification}
      />
    </NotificationContext.Provider>
  );
};