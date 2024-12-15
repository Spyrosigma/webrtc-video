'use client';

import { useState, useEffect } from 'react';

export function useControlsVisibility(timeout = 3000) {
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setShowControls(false), timeout);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, [timeout]);

  return showControls;
}