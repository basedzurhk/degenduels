'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DuelCard } from '@/components/duel-card';
import { CreateDuelModal } from '@/components/create-duel-modal';
import { WalletButton } from '@/components/wallet-button';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Duel, LeaderboardEntry } from '@/types/duel';
import { Trophy, Zap, Target, TrendingUp } from 'lucide-react';
import { sdk } from "@farcaster/miniapp-sdk";
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";

export default function HomePage(): JSX.Element {
    const { addMiniApp } = useAddMiniApp();
    const isInFarcaster = useIsInFarcaster()
    useQuickAuth(isInFarcaster)
    useEffect(() => {
      const tryAddMiniApp = async () => {
        try {
          await addMiniApp()
        } catch (error) {
          console.error('Failed to add mini app:', error)
        }

      }

    

      tryAddMiniApp()
    }, [addMiniApp])
    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (document.readyState !== 'complete') {
            await new Promise<void>(resolve => {
              if (document.readyState === 'complete') {
                resolve()
              } else {
                window.addEventListener('load', () => resolve(), { once: true })
              }

            })
          }

    

          await sdk.actions.ready()
          console.log('Farcaster SDK initialized successfully - app fully loaded')
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error)
          
          setTimeout(async () => {
            try {
              await sdk.actions.ready()
              console.log('Farcaster SDK initialized on retry')
            } catch (retryError) {
              console.error('Farcaster SDK retry failed:', retryError)
            }

          }, 1000)
        }

      }

    

      initializeFarcaster()
    }, [])
  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [allDuels, setAllDuels] = useState<Duel[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function fetchDuels(): Promise<void> {
    try {
      const [activeRes, allRes, leaderboardRes] = await Promise.all([
        fetch('/api/duels?filter=active'),
        fetch('/api/duels'),
        fetch('/api/leaderboard'),
      ]);

      const activeData = await activeRes.json() as Duel[];
      const allData = await allRes.json() as Duel[];
      const leaderboardData = await leaderboardRes.json() as LeaderboardEntry[];

      setActiveDuels(activeData);
      setAllDuels(allData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to fetch duels:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDuels();
  }, []);

  function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-3xl font-bold neon-text">⚔️ DEGEN DUELS</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/leaderboard">
              <Button variant="ghost" className="text-gray-300 hover:text-cyan-400">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </Link>
            <WalletButton />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-white">Challenge Traders to </span>
            <span className="neon-text">1v1 Battles</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Stake funds, trade for 24 hours, and let your wallet performance decide the winner.
            All on Base blockchain.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <CreateDuelModal onDuelCreated={fetchDuels} />
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-700 hover:border-cyan-500 text-white"
              asChild
            >
              <Link href="#how-it-works">
                How It Works
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg backdrop-blur">
            <Zap className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Fast Duels</h3>
            <p className="text-gray-400">
              24-hour, 48-hour, or 1-week trading battles. Choose your timeframe.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg backdrop-blur">
            <Target className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Auto Settlement</h3>
            <p className="text-gray-400">
              Smart contracts automatically determine winners based on wallet performance.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg backdrop-blur">
            <TrendingUp className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Real-Time Updates</h3>
            <p className="text-gray-400">
              Watch live wallet performance and track your opponent in real-time.
            </p>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-gray-900 border border-gray-800 mb-8">
            <TabsTrigger value="active" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Active Duels ({activeDuels.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              All Duels ({allDuels.length})
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Top Players
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Loading duels...</div>
            ) : activeDuels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No active duels. Be the first to create one!</p>
                <CreateDuelModal onDuelCreated={fetchDuels} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDuels.map((duel: Duel) => (
                  <DuelCard key={duel.id} duel={duel} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Loading duels...</div>
            ) : allDuels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No duels yet. Create the first one!</p>
                <CreateDuelModal onDuelCreated={fetchDuels} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allDuels.map((duel: Duel) => (
                  <DuelCard key={duel.id} duel={duel} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No leaderboard data yet. Complete some duels to appear here!
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.slice(0, 10).map((entry: LeaderboardEntry, index: number) => (
                  <div
                    key={entry.address}
                    className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg backdrop-blur flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-cyan-400">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {entry.displayName || formatAddress(entry.address)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {entry.totalWins}W / {entry.totalDuels}D • {entry.winRate.toFixed(1)}% Win Rate
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-400">
                        ${entry.totalVolume.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-400">
                        Biggest: ${entry.biggestWin.toFixed(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div id="how-it-works" className="mt-24 border-t border-gray-800 pt-16">
          <h2 className="text-4xl font-bold text-center mb-12 neon-text">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-cyan-400">
                1
              </div>
              <h3 className="text-xl font-bold">Create Challenge</h3>
              <p className="text-gray-400">
                Choose your stake amount and duration. Get a shareable link.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-cyan-400">
                2
              </div>
              <h3 className="text-xl font-bold">Opponent Accepts</h3>
              <p className="text-gray-400">
                Share the link. When they accept, both stakes lock and timer starts.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-cyan-400">
                3
              </div>
              <h3 className="text-xl font-bold">Trade & Compete</h3>
              <p className="text-gray-400">
                Make any trades you want. Watch live performance updates.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-cyan-400">
                4
              </div>
              <h3 className="text-xl font-bold">Winner Takes All</h3>
              <p className="text-gray-400">
                Highest % gain wins the full pot (minus 3% platform fee).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">⚠️ Risk Disclaimer</h3>
          <p className="text-gray-400">
            Degen Duels involves wagering cryptocurrency. Trade responsibly and never risk more than you can afford to lose.
            This is a competitive platform where skill and market conditions determine winners. Past performance does not guarantee future results.
          </p>
        </div>
      </div>

      <footer className="border-t border-gray-800 mt-24 py-8 text-center text-gray-500">
        <p>© 2024 Degen Duels. Built on Base. Trade at your own risk.</p>
      </footer>
    </div>
  );
}
