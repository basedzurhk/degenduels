'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WalletButton } from '@/components/wallet-button';
import type { LeaderboardEntry } from '@/types/duel';
import { ArrowLeft, Trophy, TrendingUp } from 'lucide-react';

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function LeaderboardPage(): JSX.Element {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'wins' | 'winRate' | 'volume'>('wins');

  async function fetchLeaderboard(): Promise<void> {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json() as LeaderboardEntry[];
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const sortedLeaderboard = [...leaderboard].sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
    if (sortBy === 'wins') {
      return b.totalWins - a.totalWins;
    }
    if (sortBy === 'winRate') {
      return b.winRate - a.winRate;
    }
    return b.totalVolume - a.totalVolume;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-gray-300 hover:text-cyan-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold neon-text">⚔️ DEGEN DUELS</h1>
          <WalletButton />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-5xl font-bold mb-4 neon-text">Leaderboard</h2>
          <p className="text-xl text-gray-400">Top performers in Degen Duels</p>
        </div>

        <div className="flex gap-2 mb-8 justify-center">
          <Button
            variant={sortBy === 'wins' ? 'default' : 'outline'}
            onClick={() => { setSortBy('wins'); }}
            className={sortBy === 'wins' ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-gray-700'}
          >
            Total Wins
          </Button>
          <Button
            variant={sortBy === 'winRate' ? 'default' : 'outline'}
            onClick={() => { setSortBy('winRate'); }}
            className={sortBy === 'winRate' ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-gray-700'}
          >
            Win Rate
          </Button>
          <Button
            variant={sortBy === 'volume' ? 'default' : 'outline'}
            onClick={() => { setSortBy('volume'); }}
            className={sortBy === 'volume' ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-gray-700'}
          >
            Total Volume
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading leaderboard...</div>
        ) : sortedLeaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No leaderboard data yet.</p>
            <p className="text-gray-500">Complete some duels to appear here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedLeaderboard.map((entry: LeaderboardEntry, index: number) => (
              <Card
                key={entry.address}
                className={`p-6 bg-gray-900/50 border-gray-800 backdrop-blur transition-all hover:border-cyan-500/50 ${
                  index === 0 ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10' :
                  index === 1 ? 'border-gray-400/50' :
                  index === 2 ? 'border-amber-700/50' :
                  ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[60px]">
                      <div className={`text-4xl font-bold ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-amber-700' :
                        'text-cyan-400'
                      }`}>
                        #{index + 1}
                      </div>
                      {index < 3 && (
                        <Trophy className={`w-6 h-6 mx-auto mt-1 ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-400' :
                          'text-amber-700'
                        }`} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-bold text-xl text-white mb-1">
                        {entry.displayName || formatAddress(entry.address)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatAddress(entry.address)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-8 text-center">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Wins</div>
                      <div className="text-2xl font-bold text-cyan-400">{entry.totalWins}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Duels</div>
                      <div className="text-2xl font-bold text-white">{entry.totalDuels}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                      <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                        <TrendingUp className="w-5 h-5" />
                        {entry.winRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Volume</div>
                      <div className="text-2xl font-bold text-yellow-400">
                        ${entry.totalVolume.toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-sm text-gray-400">
                  <span>Biggest Win: ${entry.biggestWin.toFixed(0)}</span>
                  <span>
                    {entry.totalWins > 0 ? 
                      `Average Win: $${(entry.totalVolume / entry.totalWins).toFixed(0)}` :
                      'No wins yet'
                    }
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Start Your First Duel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
