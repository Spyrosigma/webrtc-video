'use client';

import { useState } from 'react';

export function useMediaControls() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const toggleAudio = (stream: MediaStream | null) => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = (stream: MediaStream | null) => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return {
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
  };
}