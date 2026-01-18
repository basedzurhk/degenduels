import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDuel, saveDuel, updateLeaderboard } from '@/lib/duel-storage';
import type { Duel } from '@/types/duel';
import type { Address } from 'viem';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<Duel | { error: string }>> {
  try {
    const params = await context.params;
    const duel = getDuel(params.id);

    if (!duel) {
      return NextResponse.json({ error: 'Duel not found' }, { status: 404 });
    }

    return NextResponse.json(duel);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch duel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<Duel | { error: string }>> {
  try {
    const params = await context.params;
    const duel = getDuel(params.id);

    if (!duel) {
      return NextResponse.json({ error: 'Duel not found' }, { status: 404 });
    }

    const body = await request.json() as Partial<Duel> & { opponentAddress?: Address };

    // Accept duel
    if (body.opponentAddress && duel.status === 'pending') {
      duel.opponent = {
        address: body.opponentAddress,
      };
      duel.status = 'active';
      duel.startedAt = Date.now();
      duel.endsAt = Date.now() + duel.durationMs;
    }

    // Complete duel
    if (body.status === 'completed' && duel.status === 'active') {
      duel.status = 'completed';
      duel.completedAt = Date.now();

      if (duel.creator.percentageChange !== undefined && 
          duel.opponent?.percentageChange !== undefined) {
        const creatorWon = duel.creator.percentageChange > (duel.opponent.percentageChange || 0);
        duel.winner = creatorWon ? duel.creator.address : duel.opponent.address;
        duel.creator.isWinner = creatorWon;
        if (duel.opponent) {
          duel.opponent.isWinner = !creatorWon;
        }

        updateLeaderboard(duel.creator.address, creatorWon, duel.stakeAmountUsd * 2);
        if (duel.opponent) {
          updateLeaderboard(duel.opponent.address, !creatorWon, duel.stakeAmountUsd * 2);
        }
      }
    }

    saveDuel(duel);
    return NextResponse.json(duel);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update duel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
