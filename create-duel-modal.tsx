'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { DuelDuration } from '@/types/duel';
import { Swords } from 'lucide-react';
import { ESCROW_ADDRESS, usdToWei } from '@/lib/escrow-config';

const PRESET_AMOUNTS = [50, 100, 500, 1000];
const DURATIONS: Array<{ value: DuelDuration; label: string }> = [
  { value: '24h', label: '24 Hours' },
  { value: '48h', label: '48 Hours' },
  { value: '1w', label: '1 Week' },
];

interface CreateDuelModalProps {
  onDuelCreated?: () => void;
}

export function CreateDuelModal({ onDuelCreated }: CreateDuelModalProps): JSX.Element {
  const { address, isConnected } = useAccount();
  const [open, setOpen] = useState<boolean>(false);
  const [stakeAmount, setStakeAmount] = useState<string>('100');
  const [duration, setDuration] = useState<DuelDuration>('24h');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [pendingDuelId, setPendingDuelId] = useState<string | null>(null);

  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  async function handleCreateDuel(): Promise<void> {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    setIsCreating(true);

    try {
      // First create the duel record
      const response = await fetch('/api/duels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stakeAmount,
          duration,
          creatorAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create duel');
      }

      const duel = await response.json();
      setPendingDuelId(duel.id);
      
      toast.success('Duel created! Now send your stake to the escrow...');

      // Calculate ETH amount to send
      const weiAmount = usdToWei(parseFloat(stakeAmount));

      // Send transaction to escrow
      sendTransaction({
        to: ESCROW_ADDRESS,
        value: weiAmount,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create duel';
      toast.error(message);
      setIsCreating(false);
    }
  }

  // Handle transaction confirmation
  if (isConfirmed && pendingDuelId) {
    const duel = { id: pendingDuelId, shareUrl: `${window.location.origin}/duel/${pendingDuelId}` };
    
    toast.success('Stake sent! Share the link with your opponent.');
    
    // Copy share link to clipboard
    navigator.clipboard.writeText(duel.shareUrl).then(() => {
      toast.success('Duel link copied to clipboard!');
    });

    setOpen(false);
    setIsCreating(false);
    setPendingDuelId(null);
    
    if (onDuelCreated) {
      onDuelCreated();
    }
  }

  const isProcessing = isCreating || isSending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-lg px-8"
        >
          <Swords className="w-5 h-5 mr-2" />
          Create Duel
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Create New Duel</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <Label className="text-gray-300 mb-2 block">Stake Amount (USD)</Label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {PRESET_AMOUNTS.map((amount: number) => (
                <Button
                  key={amount}
                  type="button"
                  variant={stakeAmount === String(amount) ? 'default' : 'outline'}
                  onClick={() => { setStakeAmount(String(amount)); }}
                  className={stakeAmount === String(amount) 
                    ? 'bg-cyan-500 hover:bg-cyan-600' 
                    : 'border-gray-700 hover:border-cyan-500'}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Custom amount"
              value={stakeAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setStakeAmount(e.target.value); }}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Duration</Label>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((dur: { value: DuelDuration; label: string }) => (
                <Button
                  key={dur.value}
                  type="button"
                  variant={duration === dur.value ? 'default' : 'outline'}
                  onClick={() => { setDuration(dur.value); }}
                  className={duration === dur.value 
                    ? 'bg-cyan-500 hover:bg-cyan-600' 
                    : 'border-gray-700 hover:border-cyan-500'}
                >
                  {dur.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Your Stake:</span>
              <span className="text-white font-bold">${stakeAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Opponent Stake:</span>
              <span className="text-white font-bold">${stakeAmount}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
              <span className="text-gray-400">Total Pot:</span>
              <span className="text-cyan-400 font-bold text-lg">
                ${(parseFloat(stakeAmount) * 2).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Platform Fee (3%):</span>
              <span className="text-gray-500">
                ${(parseFloat(stakeAmount) * 2 * 0.03).toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            onClick={handleCreateDuel}
            disabled={isProcessing || !isConnected}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold"
          >
            {isSending ? 'Sending Stake...' : 
             isConfirming ? 'Confirming...' : 
             isCreating ? 'Creating...' : 
             'Create Duel & Send Stake'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
