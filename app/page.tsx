'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Video, Copy, Share2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [showShareLink, setShowShareLink] = useState(false);
  const [generatedRoomId, setGeneratedRoomId] = useState('');

  const createRoom = () => {
    const newRoomId = uuidv4();
    setGeneratedRoomId(newRoomId);
    setShowShareLink(true);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${generatedRoomId}`;
    navigator.clipboard.writeText(link);
  };

  const enterRoom = () => {
    router.push(`/room/${generatedRoomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-8">
          <div className="bg-emerald-100 p-4 rounded-full">
            <Video className="w-8 h-8 text-emerald-600" />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Video Conference</h1>
            <p className="text-gray-500">Connect with others through secure video calls</p>
          </div>

          <div className="w-full space-y-4">
            {!showShareLink ? (
              <Button
                onClick={createRoom}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Create New Room
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={`${window.location.origin}/room/${generatedRoomId}`}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyRoomLink}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={enterRoom}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Enter Room
                  </Button>
                  <Button
                    variant="outline"
                    className="flex gap-2"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Join my video conference',
                          text: 'Click the link to join my video conference room',
                          url: `${window.location.origin}/room/${generatedRoomId}`,
                        });
                      } else {
                        copyRoomLink();
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or join existing</span>
              </div>
            </div>

            <form onSubmit={joinRoom} className="space-y-2">
              <Input
                type="text"
                placeholder="Enter Room ID or paste room link"
                value={roomId}
                onChange={(e) => {
                  const input = e.target.value;
                  // Extract room ID from full URL if pasted
                  const match = input.match(/\/room\/([^\/]+)$/);
                  setRoomId(match ? match[1] : input);
                }}
                className="w-full"
              />
              <Button
                type="submit"
                variant="outline"
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                disabled={!roomId.trim()}
              >
                Join Room
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}