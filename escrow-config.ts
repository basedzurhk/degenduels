import type { Address } from 'viem';

// Escrow wallet address on Base where all duel stakes are sent
export const ESCROW_ADDRESS: Address = '0x3651141Eb057d6c8cF89658aef9F354Ab4a01411';

// Platform configuration
export const PLATFORM_FEE_PERCENT = 3;

// Convert USD amounts to ETH (simplified - in production you'd use a price oracle)
// For now, using a rough conversion rate
export const USD_TO_ETH_RATE = 0.00035; // ~$2850 per ETH

export function usdToWei(usdAmount: number): bigint {
  const ethAmount = usdAmount * USD_TO_ETH_RATE;
  // Convert to wei (1 ETH = 10^18 wei)
  return BigInt(Math.floor(ethAmount * 1e18));
}

export function weiToUsd(weiAmount: bigint): number {
  const ethAmount = Number(weiAmount) / 1e18;
  return ethAmount / USD_TO_ETH_RATE;
}
