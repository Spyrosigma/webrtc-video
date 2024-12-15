'use client';

import { Card } from '@/components/ui/card';

interface VideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  peerVideosRef: React.RefObject<Map<string, HTMLVideoElement>>;
  peers: string[];
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

export function VideoGrid({
  localVideoRef,
  peerVideosRef,
  peers,
  isVideoEnabled,
  isAudioEnabled,
}: VideoGridProps) {
  const getGridColumns = () => {
    const totalParticipants = peers.length + 1;
    if (totalParticipants <= 1) return 'grid-cols-1';
    if (totalParticipants <= 2) return 'md:grid-cols-2';
    if (totalParticipants <= 4) return 'md:grid-cols-2 lg:grid-cols-2';
    return 'md:grid-cols-3 lg:grid-cols-3';
  };

  return (
    <div className={`grid grid-cols-1 ${getGridColumns()} gap-4 auto-rows-fr`}>
      <Card className="relative aspect-video bg-emerald-900/5 rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 text-sm text-white bg-emerald-800/70 px-2 py-1 rounded">
          You {!isVideoEnabled && '(Camera Off)'} {!isAudioEnabled && '(Muted)'}
        </div>
      </Card>
      
      {peers.map((peerId) => (
        <Card key={peerId} className="relative aspect-video bg-emerald-900/5 rounded-lg overflow-hidden">
          <video
            ref={el => el && peerVideosRef.current?.set(peerId, el)}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-sm text-white bg-emerald-800/70 px-2 py-1 rounded">
            Participant {peerId.slice(0, 4)}
          </div>
        </Card>
      ))}
    </div>
  );
}