"use client";

import { useEffect, useState, Suspense } from 'react';
import { SecureWallet } from "@/app/components/wallet/secureWallet";
import WalletPage from "@/app/components/wallet/WalletPage";
import { DarkModeToggle } from '@/app/components/dark-mode-toggle';
import { Button } from "@/components/ui/button";
import TickerSafeLogo from './components/TickerSafeLogo';
import { Download, GitBranch, Compass, FileTerminal, BitcoinIcon, LayersIcon, MessageSquareHeart, Code, Code2, CodeIcon } from "lucide-react";
import { Ubuntu, Changa_One, Roboto, Saira } from "next/font/google";
const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["300", "400", "500", "700"] });
const changaOne = Changa_One({ subsets: ["latin"], weight: "400" });
const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"] });
const saira = Saira({ subsets: ["latin"], weight: ["300", "400", "500", "700"] });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"unlock" | "create" | "dashboard">("unlock");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlockedMnemonic, setUnlockedMnemonic] = useState<string | null>(null);

  // Detect wallet existence on load
  useEffect(() => {
    (async () => {
      const exists = await SecureWallet.hasMnemonic();
      setHasWallet(exists);
      setMode(exists ? "unlock" : "create");
    })();
  }, []);

  //Detect localStorage.setItem("showIntro", "false");
  useEffect(() => {
    const showIntroValue = localStorage.getItem("showIntro");
    if (showIntroValue === "false") {
      setShowIntro(false);
    }
  }, []);

  if (mode === "dashboard" && unlockedMnemonic) {
    return <WalletPage mnemonic={unlockedMnemonic} />;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    //enter skeleton loader here
    return <div className="invisible">Loading...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen font-body">
        {showIntro ? (
          <>
            <header id="header" className="w-full mx-auto flex justify-between items-center p-4 md:p-4 sticky top-0 z-20">
              <div className="flex items-center">
                <a href='/'>
                  <TickerSafeLogo
                    size={60}
                    className="hidden md:block text-lg font-bold text-primary"
                    showText={true}
                    colorClass='text-zinc-600 dark:text-gray-100'
                  />
                   <TickerSafeLogo
                    size={30}
                    className="md:hidden text-lg font-bold text-primary"
                    showText={false}
                    leftPad={-5}
                    letterSpacing={-2}
                    colorClass='text-zinc-700 dark:text-white'
                  />
                </a>
              </div>
              <div className="flex items-center ml-auto">
                <DarkModeToggle />
              </div>
            </header>
            <div
              className="w-full h-screen flex flex-col justify-center items-center mt-0"
              style={{
                backgroundImage: "url('/header_bg_purple.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="text-white bg-opacity-70 w-full max-w-xl mx-auto px-2 text-[55px] md:text-[65px] font-extrabold text-center leading-none select-none py-4 mt-0 mb-4">
                <h1>Nope Wallet Multi-chain</h1>
              </div>
              <div className="text-white bg-opacity-70 w-full max-w-xl mx-auto px-2 text-[18px] sm:text-[22px] md:text-[20px] font-semibold text-center leading-tight select-none py-2 mt-0 mb-6">
                <h1>Keep your assets safe and under your full control with Open-Source All-Browser-Based wallet without any backend server</h1>
              </div>

              <button
                onClick={() => setShowIntro(false)}
                className="text-white mt-0 px-10 py-6 rounded-full text-xl md:text-3xl font-bold shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
                style={{
                  background: "linear-gradient(90deg, #23395d 0%, #1e90ff 60%, #38ef7d 100%)", // Deep blue to green for a professional trading look
                  border: "none",
                  borderRadius: "32px 5px 45px 0px", // Softer curves, more professional
                  boxShadow: "0 4px 16px rgba(34, 57, 93, 0.15)", // Subtle shadow for depth
                }}
              >
                {hasWallet ? "Unlock Wallet" : "Get Started"}
              </button>
            </div>
            {/* Features Section */}
            <section className="w-full flex justify-center py-20 mt-20">
              <div className="w-full max-w-5xl px-4 md:px-0">
                <h2 className="text-4xl font-bold mb-12 text-center">Manage Your Crypto with Confidence</h2>
                <div className="w-full max-w-6xl grid md:grid-cols-3 gap-10 md:gap-12 px-4 md:px-0">
                  <div className="bg-gold-card rounded-2xl shadow-md p-8 flex flex-col items-center space-y-4 border border-gray-100">
                    <FileTerminal className="text-green-500" size={48} />
                    <h3 className="text-2xl font-bold">Open Source</h3>
                    <p className="text-gray-500 dark:text-orange-300 font-body">
                      The entire codebase is open for review. Ensure transparency
                      and security by inspecting how your assets are managed inside the wallet. You can run your own instance too.
                    </p>
                  </div>
                  <div className="bg-gold-card rounded-2xl shadow-md p-8 flex flex-col items-center space-y-4 border border-gray-100">
                    <Compass className="text-green-500" size={48} />
                    <h3 className="text-2xl font-bold">All in Browser</h3>
                    <p className="text-gray-500 dark:text-blue-300 font-body">
                      The wallet runs entirely in your browser and no data goes to any server.
                      Your private keys and assets remain under your full control at all times,
                      encrypted on your device with password. They never leave your browser.
                    </p>
                  </div>
                  <div className="bg-gold-card rounded-2xl shadow-md p-8 flex flex-col items-center space-y-4 border border-gray-100">
                    <Code2 className="text-green-500" size={48} />
                    <h3 className="text-2xl font-bold">Run Your Server</h3>
                    <p className="text-gray-500 dark:text-green-300 font-body">
                      You can easily run the wallet from your own server or locally.
                      The code base is NextJS with Shadcn UI components, making it easy to deploy and customize.
                      The backend server is inside the codebase if you want to run your own.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="w-full flex justify-center py-20 rounded-t-3xl">
              <div className="w-full max-w-5xl px-4 md:px-0">
                <h2 className="text-4xl font-bold mb-12 text-center">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-10 md:gap-12">
                  <div className="bg-gold-cardside rounded-xl shadow p-8 flex flex-col items-center space-y-4 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-green-400">1. Create/Import</h3>
                    <p className="text-gray-500 dark:text-gray-300 text-base">
                      Create a new wallet or import an existing one using your
                      mnemonic phrase. Your private keys are securely stored and
                      encrypted within your browser. You need to enter your password
                      and it is used to decrypt your keys locally whenever you want to use them.
                    </p>
                  </div>
                  <div className="bg-gold-cardside rounded-xl shadow p-8 flex flex-col items-center space-y-4 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-green-400 flex items-center gap-3">
                      2. Write Down Seeds
                      {/* 2. Add <TickerSafeLogo size={40} className="mt-1 ml-[-3px]" colorClass="text-green-600 dark:text-green-400" /> */}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300 text-base flex flex-col items-center gap-2">

                      Write down your seed phrases carefully and store them in a secure place. These seeds are crucial for recovering your wallet and accessing your assets.
                      We cannot recover your wallet if you lose your seeds. Write them on a piece of paper and store it somewhere safe. Do not store them digitally to avoid hacking risks.

                    </p>
                  </div>
                  <div className="bg-gold-cardside rounded-xl shadow p-8 flex flex-col items-center space-y-4 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-green-400">3. Manage Assets</h3>
                    <p className="text-gray-500 dark:text-gray-300 text-base">
                      View your assets and manage them securely within the application. Initiate transactions,
                      sign messages, and interact with supported blockchains directly from your browser.
                      All operations are performed locally, ensuring your private keys remain secure.
                    </p>
                  </div>
                </div>
                <div className="flex items-center w-full justify-center">
                  <div
                    className="w-[350px] flex flex-col md:flex-row items-center gap-3 px-6 py-4 rounded-xl shadow-md bg-zinc-200 dark:bg-zinc-800 mt-12 border border-md border-black dark:border-blue-400"
                  >
                    <a
                      href="#"
                      onClick={() => setShowIntro(false)}
                      className="text-blue-600 dark:text-blue-300 text-lg font-semibold text-center"
                      style={{ outline: "none" }}
                    >
                      Get Started With 
                    <TickerSafeLogo
                      size={48}
                      letterSpacing={-2}
                      showText={false}
                      colorClass="text-blue-400 dark:text-blue-400"
                    />
                    </a> 
                  </div>
                </div>
              </div>
            </section>

            {/* CTA / Micro-Payment Section */}
            <section className="w-full flex justify-center py-20">
              <div className="w-full max-w-3xl px-4 md:px-0 text-center space-y-6">

              </div>
            </section>

       {/* Footer */}
        <footer className="text-sm flex flex-col md:flex-row justify-center items-center">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex flex-row items-center justify-center gap-4 mb-2">
              <DarkModeToggle />
              <span title="Documentation">
                <Button
                  variant="ghost"
                  size="icon"
                  className="border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
                  onClick={() => window.open('/docs-placement', '_blank')}
                >
                  <LayersIcon size={24} />
                </Button>
              </span>
              <span title="Downloads">
                <Button
                  variant="ghost"
                  size="icon"
                  className="border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
                  onClick={() => window.open('https://github.com/nopewallet/nopewallet', '_blank')}
                >
                  <Download size={24} />
                </Button>
              </span>
              <span title="GitHub Repository">
                <Button
                  variant="ghost"
                  size="icon"
                  className="border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
                  onClick={() => window.open('https://github.com/nopewallet/nopewallet', '_blank')}
                >
                  <GitBranch size={24} />
                </Button>
              </span>
              <span title="Reviews and Feedback">
                <Button
                  variant="ghost"
                  size="icon"
                  className="border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
                  onClick={() => window.open('https://producthunt.com/nopewallet', '_blank')}
                >
                  <MessageSquareHeart size={24} />
                </Button>
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg p-2">
                <p className="text-[13px] text-center">
                &copy; 2025 Copyright.{" "}
                <a
                  href="https://paynope.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-300"
                >
                  Paynope Crypto Gateway
                </a>
                . All rights reserved.
                </p>
            </div>
          </div>
        </footer>
          </>

        ) : (

        <WalletPage mnemonic={unlockedMnemonic || ""} />
          
        )}
      </div>
    </Suspense>
  );
}
