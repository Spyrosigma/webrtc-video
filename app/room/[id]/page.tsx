'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { WebRTCManager } from '@/lib/webrtc';
import { VideoGrid } from '@/components/room/VideoGrid';
import { Controls } from '@/components/room/Controls';
import { ParticipantCount } from '@/components/room/ParticipantCount';

export default function Room() {
  const { id: roomId } = useParams();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [peers, setPeers] = useState<string[]>([]);
  const [showControls, setShowControls] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const socketRef = useRef<any>(null);
  const webRTCManagerRef = useRef<WebRTCManager | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    const webRTCManager = new WebRTCManager(socket, handleTrack);
    webRTCManagerRef.current = webRTCManager;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', roomId, socket.id);
    });

    socket.on('room-users', (users: string[]) => {
      setPeers(users.filter(id => id !== socket.id));
    });

    startMedia();

    // Auto-hide controls after 3 seconds of inactivity
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      webRTCManager.cleanup();
      socket.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [roomId]);

  const startMedia = async () => {
    try {
      const stream = await webRTCManagerRef.current?.startLocalStream();
      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Media Error:', error);
    }
  };

  const handleTrack = (userId: string, stream: MediaStream) => {
    const videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.srcObject = stream;
    peerVideosRef.current.set(userId, videoElement);
    setPeers(prev => [...prev, userId]);
  };

  const toggleAudio = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
  };

  const shareRoom = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join my video conference',
        text: 'Click the link to join my video conference room',
        url: link,
      });
    } else {
      copyRoomLink();
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', roomId, socketRef.current.id);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <VideoGrid
          localVideoRef={localVideoRef}
          peerVideosRef={peerVideosRef}
          peers={peers}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
        />
        
        <Controls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          showControls={showControls}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          copyRoomLink={copyRoomLink}
          shareRoom={shareRoom}
          leaveRoom={leaveRoom}
        />

        <ParticipantCount count={peers.length + 1} />
      </div>
    </div>
  );
}