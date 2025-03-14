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
    setNotification({ message, type, duration });
  };

  const clearNotification = () => {
    setNotification({ ...notification, message: '' });
  };

  // Shorthand methods for different notification types
  const showSuccess = (message, duration) => showNotification({ message, type: 'success', duration });
  const showError = (message, duration) => showNotification({ message, type: 'error', duration });
  const showWarning = (message, duration) => showNotification({ message, type: 'warning', duration });
  const showInfo = (message, duration) => showNotification({ message, type: 'info', duration });

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