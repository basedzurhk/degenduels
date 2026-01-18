import type { Address } from 'viem';

export type DuelStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export type DuelDuration = '24h' | '48h' | '1w';

export interface WalletSnapshot {
  address: Address;
  timestamp: number;
  totalValueUsd: number;
  tokens: Array<{
    symbol: string;
    balance: string;
    valueUsd: number;
  }>;
}

export interface Participant {
  address: Address;
  displayName?: string;
  startSnapshot?: WalletSnapshot;
  endSnapshot?: WalletSnapshot;
  percentageChange?: number;
  isWinner?: boolean;
}

export interface Duel {
  id: string;
  status: DuelStatus;
  stakeAmount: string;
  stakeAmountUsd: number;
  duration: DuelDuration;
  durationMs: number;
  createdAt: number;
  startedAt?: number;
  endsAt?: number;
  completedAt?: number;
  creator: Participant;
  opponent?: Participant;
  winner?: Address;
  totalPot: string;
  platformFeePercent: number;
  shareUrl?: string;
}

export interface LeaderboardEntry {
  address: Address;
  displayName?: string;
  totalWins: number;
  totalDuels: number;
  winRate: number;
  biggestWin: number;
  totalVolume: number;
}

export interface CreateDuelParams {
  stakeAmount: string;
  duration: DuelDuration;
  creatorAddress: Address;
}

export interface AcceptDuelParams {
  duelId: string;
  opponentAddress: Address;
}
