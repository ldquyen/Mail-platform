import { addToast } from '@heroui/react';

export function useToast() {
  const showSuccess = (message: string) => {
    addToast({
      description: message,
      color: "success",
    });
  };

  const showError = (message: string) => {
    addToast({
      description: message,
      color: "danger",
    });
  };

  const showWarning = (message: string) => {
    addToast({
      description: message,
      color: "warning",
    });
  };

  const showInfo = (message: string) => {
    addToast({
      description: message,
      color: "primary",
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
