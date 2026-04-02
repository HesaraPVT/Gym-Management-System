import React, { useState, useEffect, useCallback } from 'react';
import './Toast.css';

const toastManager = {
  listeners: [],
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  emit(toast) {
    this.listeners.forEach(listener => listener(toast));
  }
};

export const useToast = () => {
  return {
    success: (message) => {
      toastManager.emit({
        id: Date.now(),
        message,
        type: 'success'
      });
    },
    error: (message) => {
      toastManager.emit({
        id: Date.now(),
        message,
        type: 'error'
      });
    },
    info: (message) => {
      toastManager.emit({
        id: Date.now(),
        message,
        type: 'info'
      });
    },
    warning: (message) => {
      toastManager.emit({
        id: Date.now(),
        message,
        type: 'warning'
      });
    }
  };
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(toast => {
      setToasts(prev => [...prev, toast]);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    });

    return unsubscribe;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-message">{toast.message}</span>
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
            {toast.type === 'warning' && '⚠'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
