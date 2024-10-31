import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

export const useTelegramWebApp = () => {
  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
  }, []);

  const showAlert = (message: string) => {
    WebApp.showAlert(message);
  };

  const showConfirm = (message: string) => {
    WebApp.showConfirm(message);
  };

  return {
    showAlert,
    showConfirm,
    webApp: WebApp
  };
};