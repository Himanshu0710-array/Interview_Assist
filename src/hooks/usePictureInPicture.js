import { useState, useCallback } from 'react';

export function useFloatingWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = { current: null };

  const open = useCallback(() => {
    // Close any existing popup
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }

    const width = 390;
    const height = 620;
    const left = window.screen.availWidth - width - 20;
    const top = Math.round((window.screen.availHeight - height) / 2);

    const popup = window.open(
      '/?pip=true',
      'InterviewAI_Float',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,status=no,location=no,toolbar=no,menubar=no`
    );

    if (!popup) {
      alert('⚠️ Popup blocked!\n\nTo fix: Click the popup-blocked icon in Chrome\'s address bar → "Always allow popups from localhost" → then click the float button again.');
      return;
    }

    popupRef.current = popup;
    setIsOpen(true);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setIsOpen(false);
      }
    }, 500);
  }, []);

  const close = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    setIsOpen(false);
  }, []);

  return { isOpen, open, close };
}
