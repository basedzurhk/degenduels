import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@coinbase/onchainkit/styles.css';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import FarcasterWrapper from "@/components/FarcasterWrapper";

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
        <html lang="en" className="dark">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
          >
            <Providers>
              
      <FarcasterWrapper>
        {children}
      </FarcasterWrapper>
      
              <Toaster />
            </Providers>
          </body>
        </html>
      );
}

export const metadata: Metadata = {
        title: "Degen Duels",
        description: "Challenge crypto traders to 1v1 wallet performance duels with a gamified UI. Stake funds in smart contracts, compete for the largest percentage gain, and win the pot. Mobile-friendly and Web3 integrated.",
        other: { "fc:frame": JSON.stringify({"version":"next","imageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_7f8d6e2a-3ba8-496f-93c3-6f7721d59fe7-xil3wWlZOwK5PWT0A8LJkfyI68efMO","button":{"title":"Open with Ohara","action":{"type":"launch_frame","name":"Degen Duels","url":"https://expression-paragraph-261.app.ohara.ai","splashImageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg","splashBackgroundColor":"#ffffff"}}}
        ) }
    };
