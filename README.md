# ⚔️ Degen Duels

A crypto trading competition platform where traders challenge each other to 1v1 wallet performance battles on Base blockchain.

## 🎮 How It Works

1. **Create a Duel** - Set your stake amount and challenge duration
2. **Share the Link** - Send your unique duel link to an opponent
3. **Both Stake** - Both players send their stakes to the escrow wallet
4. **Trade & Compete** - Make trades during the duel period to maximize gains
5. **Winner Takes All** - Admin manually determines winner based on % gains and sends payout

## 🔑 Manual Mode

This version operates in **manual mode** for simplicity:

- **Escrow Address**: `0x3651141Eb057d6c8cF89658aef9F354Ab4a01411` (Base)
- **Stakes**: Players send ETH directly to escrow when creating/accepting duels
- **Winner Determination**: Admin manually checks wallet performance and declares winner
- **Payouts**: Admin manually sends winnings to winner's wallet
- **Platform Fee**: 3% of total pot

## 📱 Features

### Core Functionality
- ✅ Create duel challenges with custom stake amounts
- ✅ Choose duel duration (24h, 48h, 1 week)
- ✅ Share unique challenge links
- ✅ Accept duels and stake funds via wallet
- ✅ Real-time wallet performance tracking
- ✅ Live countdown timers
- ✅ Confetti celebration for winners!

### UI/UX
- 🎨 Dark mode with neon cyan/blue accents
- 📱 Fully mobile-responsive design
- ⚡ Smooth animations and transitions
- 🎮 Gamified trading competition experience
- 🐦 Share results directly to Twitter
- 📊 Global leaderboard with sorting

### Technical
- ⚛️ Next.js 15 with React 19
- 🔗 OnchainKit for Base blockchain integration
- 💼 Multi-wallet support (Coinbase, MetaMask, Phantom, Rabby, Trust)
- 📡 DeBank API for wallet value tracking
- 🎯 TypeScript for type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Base wallet with some ETH for testing

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📝 Environment Variables

The app works out of the box, but you can optionally configure:

```env
# DeBank API (optional - for production wallet tracking)
DEBANK_API_KEY=your_debank_api_key

# Network (optional - defaults to Base Sepolia testnet)
NEXT_PUBLIC_SDK_CHAIN_ID=8453  # Base mainnet
```

## 🎯 Usage

### For Players

1. **Connect Wallet** - Use the wallet button in the top right
2. **Create Duel** - Click "Create Duel" and set your stake/duration
3. **Send Stake** - Approve the transaction to send ETH to escrow
4. **Share Link** - Copy the generated link and send to your opponent
5. **Wait for Opponent** - Opponent accepts and sends their stake
6. **Trade!** - Make your best trades during the duel period
7. **Check Results** - Admin will declare winner after time expires

### For Admin

1. **Monitor Duels** - Check active duels on the platform
2. **Track Performance** - Use DeBank or wallet explorers to check final wallet values
3. **Determine Winner** - Compare percentage gains at end time
4. **Send Payout** - Manually send 97% of pot to winner (3% fee retained)

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── duels/        # Duel CRUD operations
│   │   ├── wallet-value/ # Wallet value fetching
│   │   └── leaderboard/  # Leaderboard data
│   ├── duel/[id]/        # Individual duel page
│   ├── leaderboard/      # Global leaderboard page
│   └── page.tsx          # Homepage
├── components/           # React components
│   ├── ui/               # shadcn/ui components
│   ├── create-duel-modal.tsx
│   ├── duel-card.tsx
│   └── wallet-button.tsx
├── lib/
│   ├── escrow-config.ts  # Escrow address and config
│   ├── wagmi.ts          # Wallet configuration
│   └── duel-storage.ts   # Duel data storage
└── types/
    └── duel.ts           # TypeScript types
```

## 🔐 Security Notes

- Stakes are sent to a multi-sig or secure escrow wallet
- All transactions are on-chain and verifiable
- Admin manually processes payouts to prevent automation exploits
- Users should verify the escrow address before sending funds

## 🎨 Customization

### Change Escrow Address

Edit `src/lib/escrow-config.ts`:

```typescript
export const ESCROW_ADDRESS: Address = 'YOUR_ESCROW_ADDRESS_HERE';
```

### Adjust Platform Fee

Edit `src/lib/escrow-config.ts`:

```typescript
export const PLATFORM_FEE_PERCENT = 3; // Change to your desired percentage
```

### Modify ETH Conversion Rate

Update the conversion in `src/lib/escrow-config.ts`:

```typescript
export const USD_TO_ETH_RATE = 0.00035; // Adjust based on current ETH price
```

## 📊 Leaderboard

The leaderboard tracks:
- Total duels won
- Win percentage
- Biggest single win
- Total volume dueled

Sort by any metric to find top performers!

## 🐦 Social Sharing

Players can share their victories on Twitter with:
- Duel results
- Percentage gains
- Challenge links
- Trophy emojis 🏆

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Blockchain**: Base (via OnchainKit)
- **Wallets**: wagmi, viem, Coinbase Wallet SDK
- **APIs**: DeBank for wallet value tracking
- **State**: React hooks, local storage

## 📱 Mobile Support

The app is fully optimized for mobile devices with:
- Touch-friendly controls
- Responsive layouts
- Mobile wallet deep linking
- Optimized for Coinbase Wallet mobile app

## ⚠️ Disclaimers

- This is a trading competition platform - all trades are at your own risk
- Platform operates in manual mode - winners determined by admin review
- Always verify the escrow address before sending funds
- Platform fee is deducted from total pot before payout
- No guarantee of payout timing or dispute resolution

## 🚧 Future Enhancements

Potential features for future versions:
- Automated smart contract escrow and payouts
- Team battles (2v2, 3v3)
- Tournament modes
- Public matchmaking
- On-chain oracle integration for automated winner determination
- Multi-chain support
- NFT trophies for winners

## 📄 License

MIT License - feel free to fork and customize!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ⚡ by crypto degens, for crypto degens.

**Good luck with your duels! May your trades be green and your bags heavy! 💰🚀**
