import type { Duel, LeaderboardEntry } from '@/types/duel';
import type { Address } from 'viem';

// In-memory storage for MVP (replace with database in production)
const duels: Map<string, Duel> = new Map();
const leaderboard: Map<Address, LeaderboardEntry> = new Map();

export function saveDuel(duel: Duel): void {
  duels.set(duel.id, duel);
}

export function getDuel(id: string): Duel | undefined {
  return duels.get(id);
}

export function getAllDuels(): Duel[] {
  return Array.from(duels.values());
}

export function getActiveDuels(): Duel[] {
  return Array.from(duels.values()).filter(
    (d: Duel) => d.status === 'active' || d.status === 'pending'
  );
}

export function updateLeaderboard(address: Address, won: boolean, amount: number): void {
  const entry = leaderboard.get(address) || {
    address,
    totalWins: 0,
    totalDuels: 0,
    winRate: 0,
    biggestWin: 0,
    totalVolume: 0,
  };

  entry.totalDuels += 1;
  if (won) {
    entry.totalWins += 1;
    entry.biggestWin = Math.max(entry.biggestWin, amount);
  }
  entry.winRate = (entry.totalWins / entry.totalDuels) * 100;
  entry.totalVolume += amount;

  leaderboard.set(address, entry);
}

export function getLeaderboard(): LeaderboardEntry[] {
  return Array.from(leaderboard.values()).sort(
    (a: LeaderboardEntry, b: LeaderboardEntry) => b.totalWins - a.totalWins
  );
}
