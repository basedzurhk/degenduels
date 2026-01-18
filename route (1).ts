import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { saveDuel, getAllDuels, getActiveDuels } from '@/lib/duel-storage';
import type { Duel, CreateDuelParams } from '@/types/duel';

const DURATION_MAP = {
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
};

export async function GET(request: NextRequest): Promise<NextResponse<Duel[] | { error: string }>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');

    const duels = filter === 'active' ? getActiveDuels() : getAllDuels();
    return NextResponse.json(duels);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch duels';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<Duel | { error: string }>> {
  try {
    const body = await request.json() as CreateDuelParams;
    const { stakeAmount, duration, creatorAddress } = body;

    const duelId = `duel-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const durationMs = DURATION_MAP[duration];

    const newDuel: Duel = {
      id: duelId,
      status: 'pending',
      stakeAmount,
      stakeAmountUsd: parseFloat(stakeAmount),
      duration,
      durationMs,
      createdAt: Date.now(),
      creator: {
        address: creatorAddress,
      },
      totalPot: (parseFloat(stakeAmount) * 2).toString(),
      platformFeePercent: 3,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/duel/${duelId}`,
    };

    saveDuel(newDuel);
    return NextResponse.json(newDuel);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create duel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
