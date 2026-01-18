'use client';

import { useEffect, useState, use } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/countdown-timer';
import { WalletButton } from '@/components/wallet-button';
import type { Duel, WalletSnapshot } from '@/types/duel';
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import Confetti from 'react-confetti';
import { ESCROW_ADDRESS, usdToWei } from '@/lib/escrow-config';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function DuelPage({ params }: PageProps): JSX.Element {
  const resolvedParams = use(params);
  const { address, isConnected } = useAccount();
  const [duel, setDuel] = useState<Duel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [creatorSnapshot, setCreatorSnapshot] = useState<WalletSnapshot | null>(null);
  const [opponentSnapshot, setOpponentSnapshot] = useState<WalletSnapshot | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  async function fetchDuel(): Promise<void> {
    try {
      const response = await fetch(`/api/duels/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Duel not found');
      }
      const data = await response.json() as Duel;
      setDuel(data);

      // Fetch live wallet snapshots if duel is active
      if (data.status === 'active') {
        const [creatorRes, opponentRes] = await Promise.all([
          fetch(`/api/wallet-value?address=${data.creator.address}`),
          data.opponent ? fetch(`/api/wallet-value?address=${data.opponent.address}`) : Promise.resolve(null),
        ]);

        const creatorData = await creatorRes.json() as WalletSnapshot;
        setCreatorSnapshot(creatorData);

        if (opponentRes && data.opponent) {
          const opponentData = await opponentRes.json() as WalletSnapshot;
          setOpponentSnapshot(opponentData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch duel:', error);
      toast.error('Failed to load duel');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAcceptDuel(): Promise<void> {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (duel && address === duel.creator.address) {
      toast.error('You cannot accept your own duel');
      return;
    }

    setIsAccepting(true);

    try {
      // First register as opponent
      const response = await fetch(`/api/duels/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opponentAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept duel');
      }

      toast.success('Duel accepted! Now send your stake to the escrow...');

      // Calculate ETH amount to send
      if (duel) {
        const weiAmount = usdToWei(parseFloat(duel.stakeAmount));

        // Send transaction to escrow
        sendTransaction({
          to: ESCROW_ADDRESS,
          value: weiAmount,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept duel';
      toast.error(message);
      setIsAccepting(false);
    }
  }

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Stake sent! The duel begins now.');
      setIsAccepting(false);
      fetchDuel();
    }
  }, [isConfirmed]);

  async function handleShareDuel(): Promise<void> {
    if (duel?.shareUrl) {
      await navigator.clipboard.writeText(duel.shareUrl);
      toast.success('Share link copied to clipboard!');
    }
  }

  async function handleShareResults(): Promise<void> {
    if (!duel) {
      return;
    }
    const winnerAddr = duel.winner ? formatAddress(duel.winner) : 'Unknown';
    const tweetText = `🏆 Just won a $${duel.totalPot} duel on @DegenDuels! 💰\n\nChallenge me: ${duel.shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  }

  useEffect(() => {
    fetchDuel();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (!duel || duel.status !== 'active') {
      return;
    }

    const interval = setInterval(() => {
      fetchDuel();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [duel]);

  useEffect(() => {
    if (duel?.status === 'completed' && duel.winner === address) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [duel, address]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-2xl text-gray-400">Loading duel...</div>
      </div>
    );
  }

  if (!duel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-400 mb-4">Duel not found</div>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const creatorPerf = creatorSnapshot && duel.creator.startSnapshot
    ? ((creatorSnapshot.totalValueUsd - duel.creator.startSnapshot.totalValueUsd) / duel.creator.startSnapshot.totalValueUsd) * 100
    : 0;

  const opponentPerf = opponentSnapshot && duel.opponent?.startSnapshot
    ? ((opponentSnapshot.totalValueUsd - duel.opponent.startSnapshot.totalValueUsd) / duel.opponent.startSnapshot.totalValueUsd) * 100
    : 0;

  const isProcessing = isAccepting || isSending || isConfirming;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {showConfetti && <Confetti />}

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl font-bold">Duel #{resolvedParams.id.slice(-8)}</h2>
              <Badge className={
                duel.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                duel.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                'bg-blue-500/20 text-blue-400 border-blue-500/50'
              }>
                {duel.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-400">Stake: ${duel.stakeAmount} • Duration: {duel.duration}</p>
          </div>
          <Button
            onClick={handleShareDuel}
            variant="outline"
            className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
        </div>

        {duel.status === 'pending' && (
          <Card className="p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center">Waiting for Opponent</h3>
            <p className="text-gray-400 mb-6 text-center">
              Share the link above to challenge someone to this duel!
            </p>

            {address !== duel.creator.address && (
              <div className="text-center">
                <Button
                  onClick={handleAcceptDuel}
                  disabled={isProcessing}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  {isSending ? 'Sending Stake...' : 
                   isConfirming ? 'Confirming...' : 
                   isAccepting ? 'Accepting...' : 
                   `Accept Duel & Send $${duel.stakeAmount}`}
                </Button>
              </div>
            )}
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Creator</h3>
              {duel.creator.isWinner && (
                <Trophy className="w-6 h-6 text-yellow-400" />
              )}
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400">Wallet</div>
                <div className="font-mono text-cyan-400">{formatAddress(duel.creator.address)}</div>
              </div>
              {duel.status === 'active' && creatorSnapshot && (
                <>
                  <div>
                    <div className="text-sm text-gray-400">Current Value</div>
                    <div className="text-2xl font-bold">${creatorSnapshot.totalValueUsd.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Performance</div>
                    <div className={`text-3xl font-bold flex items-center gap-2 ${creatorPerf >= 0 ? 'glow-green text-green-400' : 'glow-red text-red-400'}`}>
                      {creatorPerf >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                      {creatorPerf >= 0 ? '+' : ''}{creatorPerf.toFixed(2)}%
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Opponent</h3>
              {duel.opponent?.isWinner && (
                <Trophy className="w-6 h-6 text-yellow-400" />
              )}
            </div>
            {!duel.opponent ? (
              <div className="text-center py-8 text-gray-400">Waiting for opponent...</div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Wallet</div>
                  <div className="font-mono text-cyan-400">{formatAddress(duel.opponent.address)}</div>
                </div>
                {duel.status === 'active' && opponentSnapshot && (
                  <>
                    <div>
                      <div className="text-sm text-gray-400">Current Value</div>
                      <div className="text-2xl font-bold">${opponentSnapshot.totalValueUsd.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Performance</div>
                      <div className={`text-3xl font-bold flex items-center gap-2 ${opponentPerf >= 0 ? 'glow-green text-green-400' : 'glow-red text-red-400'}`}>
                        {opponentPerf >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        {opponentPerf >= 0 ? '+' : ''}{opponentPerf.toFixed(2)}%
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-8 bg-gray-900/50 border-gray-800 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Total Pot</div>
              <div className="text-4xl font-bold text-cyan-400 neon-text">
                ${duel.totalPot}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">
                {duel.status === 'active' ? 'Time Remaining' : 'Duration'}
              </div>
              <div className="text-2xl font-bold">
                {duel.status === 'active' && duel.endsAt ? (
                  <CountdownTimer endsAt={duel.endsAt} />
                ) : (
                  <span className="text-gray-300">{duel.duration}</span>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Platform Fee</div>
              <div className="text-2xl font-bold text-gray-300">
                {duel.platformFeePercent}%
              </div>
            </div>
          </div>
        </Card>

        {duel.status === 'completed' && duel.winner && (
          <Card className="p-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4">Winner Declared!</h3>
            <p className="text-xl mb-2">
              <span className="text-yellow-400 font-bold">{formatAddress(duel.winner)}</span>
            </p>
            <p className="text-gray-400 mb-6">
              Won ${(parseFloat(duel.totalPot) * 0.97).toFixed(2)} (after 3% platform fee)
            </p>
            <Button
              onClick={handleShareResults}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Results on Twitter
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
