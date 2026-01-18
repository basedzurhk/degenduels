'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from './countdown-timer';
import type { Duel } from '@/types/duel';
import { ArrowRight, Trophy, Users } from 'lucide-react';

interface DuelCardProps {
  duel: Duel;
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function DuelCard({ duel }: DuelCardProps): JSX.Element {
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    active: 'bg-green-500/20 text-green-400 border-green-500/50',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  return (
    <Link href={`/duel/${duel.id}`}>
      <Card className="p-6 bg-gray-900/50 border-gray-800 hover:border-cyan-500/50 transition-all cursor-pointer backdrop-blur">
        <div className="flex items-start justify-between mb-4">
          <Badge className={statusColors[duel.status]}>
            {duel.status.toUpperCase()}
          </Badge>
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Pot</div>
            <div className="text-2xl font-bold text-cyan-400">
              ${duel.totalPot}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">
                {formatAddress(duel.creator.address)}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500" />
            <div className="text-gray-300">
              {duel.opponent
                ? formatAddress(duel.opponent.address)
                : 'Waiting...'}
            </div>
          </div>

          {duel.status === 'active' && duel.endsAt && (
            <div className="pt-3 border-t border-gray-800">
              <div className="text-sm text-gray-400 mb-1">Time Remaining</div>
              <CountdownTimer endsAt={duel.endsAt} />
            </div>
          )}

          {duel.status === 'completed' && duel.winner && (
            <div className="pt-3 border-t border-gray-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Winner: </span>
              <span className="text-yellow-400 font-bold">
                {formatAddress(duel.winner)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-400 pt-2">
            <span>Stake: ${duel.stakeAmount}</span>
            <span>{duel.duration}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
