import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/duel-storage';
import type { LeaderboardEntry } from '@/types/duel';

export async function GET(): Promise<NextResponse<LeaderboardEntry[]>> {
  const leaderboard = getLeaderboard();
  return NextResponse.json(leaderboard);
}
