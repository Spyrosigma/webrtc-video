'use client';

import { Users } from 'lucide-react';

interface ParticipantCountProps {
  count: number;
}

export function ParticipantCount({ count }: ParticipantCountProps) {
  return (
    <div className="fixed top-4 right-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
      <Users className="h-4 w-4 text-emerald-600" />
      <span className="text-sm font-medium">{count} participants</span>
    </div>
  );
}