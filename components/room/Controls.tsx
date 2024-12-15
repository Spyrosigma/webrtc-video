'use client';

import { Button } from '@/components/ui/button';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Copy, Share2 } from 'lucide-react';

interface ControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  showControls: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  copyRoomLink: () => void;
  shareRoom: () => void;
  leaveRoom: () => void;
}

export function Controls({
  isAudioEnabled,
  isVideoEnabled,
  showControls,
  toggleAudio,
  toggleVideo,
  copyRoomLink,
  shareRoom,
  leaveRoom,
}: ControlsProps) {
  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white p-4 rounded-full shadow-lg transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleAudio}
        className={`rounded-full ${!isAudioEnabled && 'bg-red-100 text-red-600'}`}
      >
        {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={toggleVideo}
        className={`rounded-full ${!isVideoEnabled && 'bg-red-100 text-red-600'}`}
      >
        {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </Button>

      <div className="h-8 w-px bg-gray-200" />
      
      <Button
        variant="outline"
        size="icon"
        onClick={copyRoomLink}
        className="rounded-full"
      >
        <Copy className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={shareRoom}
        className="rounded-full"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <div className="h-8 w-px bg-gray-200" />

      <Button
        variant="destructive"
        size="icon"
        onClick={leaveRoom}
        className="rounded-full"
      >
        <PhoneOff className="h-4 w-4" />
      </Button>
    </div>
  );
}