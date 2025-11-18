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

            {/* Why we built Nopewallet Section */}
            <section className="w-full flex justify-center py-20 rounded-t-3xl">
              <div className="w-full max-w-5xl px-4 md:px-0">
                <h2 className="text-4xl font-bold mb-12 text-center">Why we built Nopewallet</h2>
                  <div className="bg-gold-cardside rounded-xl shadow p-8 flex flex-col items-center space-y-4 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-green-400">Lack of Easy to Integrate Wallet</h3>
                    <p className="text-gray-500 dark:text-gray-300 text-base">
                      We are working on <a href="https://paynope.com" target="_blank" rel="noopener noreferrer" className="text-blue-300">Paynope</a>, a crypto payment gateway, and found it challenging to find a simple, secure, and open-source web wallet that we could easily integrate into our platform.
                      Most existing wallets were either too complex, had backend dependencies, or lacked transparency.
                      This motivated us to create Nopewallet, a wallet that meets our needs and can be used by others as well. We 
                      have open-sourced the project to contribute to the community and promote secure, user-controlled asset management.
                    </p>
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
            <section className="w-full flex justify-center py-20">
              <div className="mt-12 flex justify-center w-full max-w-3xl px-4 md:px-0">
                {/* Embed Tweet using Twitter's embed script */}
                <blockquote className="twitter-tweet" data-theme="dark">
                  <a href="https://twitter.com/nopewallet/status/1990666817761915029"></a>
                </blockquote>
                <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
              </div>


            </section>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md px-8 py-6 flex flex-col items-center"></div>
            {/* CTA / Micro-Payment Section */}
            <section className="w-full flex justify-center py-20">
              <div className="w-full flex flex-col md:flex-row justify-center items-center gap-8">
                {/* Product Hunt Badge */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md px-8 py-6 flex flex-col items-center">
                  <a
                    href="https://www.producthunt.com/products/nopewallet?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-nopewallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center"
                  >
                    <img
                      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1039442&theme=light&t=1763445821880"
                      alt="Nopewallet - A&#0032;Simple&#0044;&#0032;Secure&#0044;&#0032;Open&#0045;Source&#0032;Multi&#0045;Chain&#0032;Web&#0032;Wallet | Product Hunt"
                      style={{ width: 250, height: 54 }}
                      width={250}
                      height={54}
                      className="dark:hidden"
                    />
                    <img
                      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1039442&theme=dark&t=1763445821880"
                      alt="Nopewallet - A&#0032;Simple&#0044;&#0032;Secure&#0044;&#0032;Open&#0045;Source&#0032;Multi&#0045;Chain&#0032;Web&#0032;Wallet | Product Hunt"
                      style={{ width: 250, height: 54 }}
                      width={250}
                      height={54}
                      className="hidden dark:block"
                    />
                  </a>
                </div>


                {/* GitHub Star Badge */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md px-8 py-6 flex flex-col items-center">
                  <a
                    href="https://github.com/nopewallet/nopewallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center"
                  >
                    <img
                      src="https://img.shields.io/github/stars/nopewallet/nopewallet?style=social"
                      alt="GitHub stars"
                      style={{ width: 180, height: 40 }}
                      width={180}
                      height={40}
                      className="dark:hidden"
                    />
                    <img
                      src="https://img.shields.io/github/stars/nopewallet/nopewallet?style=social&labelColor=22272e&color=2ea44f"
                      alt="GitHub stars"
                      style={{ width: 180, height: 40 }}
                      width={180}
                      height={40}
                      className="hidden dark:block"
                    />
                  </a>
                  <span className="mt-2 text-gray-700 dark:text-gray-200 text-sm">
                    Star us on GitHub!
                  </span>
                </div>
                {/* Telegram Channel Badge */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md px-8 py-6 flex flex-col items-center">
                  <a
                    href="https://t.me/nope_wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center"
                  >
                    <img
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg"
                      alt="Join our Telegram"
                      style={{ width: 40, height: 40, marginBottom: 8, filter: "invert(40%) sepia(80%) saturate(500%) hue-rotate(180deg)" }}
                      width={40}
                      height={40}
                    />
                    <span className="text-blue-600 dark:text-blue-300 text-lg font-semibold text-center">
                      Join our Telegram
                    </span>
                  </a>
                </div>
              </div>

            </section>


            {/* Footer */}
            <footer className="text-sm flex flex-col md:flex-row justify-center items-center">
              <div className="flex flex-col items-center justify-center w-full">
                <div className="flex flex-row items-center justify-center gap-2 mb-2">
                  <DarkModeToggle />
                  <span title="Documentation">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
                      onClick={() => window.open('https://github.com/nopewallet/nopewallet', '_blank')}
                    >
                      <LayersIcon size={22} />
                    </Button>
                  </span>
                  <span title="Downloads">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
                      onClick={() => window.open('https://github.com/nopewallet/nopewallet', '_blank')}
                    >
                      <Download size={22} />
                    </Button>
                  </span>
                  <span title="GitHub Repository">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
                      onClick={() => window.open('https://github.com/nopewallet/nopewallet', '_blank')}
                    >
                      <GitBranch size={22} />
                    </Button>
                  </span>
                  <span title="Reviews and Feedback">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
                      onClick={() => window.open('https://www.producthunt.com/p/self-promotion/introducing-nope-wallet-a-privacy-first-multi-chain-wallet-you-can-read-fork-and-trust', '_blank')}
                    >
                      <MessageSquareHeart size={22} />
                    </Button>
                  </span>
                  <span title="X (Twitter)">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
                      onClick={() => window.open('https://x.com/nopewallet', '_blank')}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path fill="currentColor" d="M17.53 3H21.5l-7.19 8.21L23 21h-7.19l-5.66-6.49L3.98 21H0l7.78-8.89L1 3h7.31l5.09 5.84L17.53 3zm-2.02 15.3h2.01l-5.44-6.25-1.6-1.84L4.47 5.29h-2l5.44 6.25 1.6 1.84 5.99 6.92z"/>
                      </svg>
                    </Button>
                  </span>
                  <span title="Discord">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border-none shadow-none focus:ring-0 focus:outline-none cursor-pointer"
                      onClick={() => window.open('https://discord.gg/bDH5EHZp', '_blank')}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path fill="currentColor" d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.3a.07.07 0 0 0-.073.035c-.321.566-.677 1.304-.926 1.89a18.524 18.524 0 0 0-5.772 0 12.51 12.51 0 0 0-.938-1.89.07.07 0 0 0-.073-.035c-1.43.327-2.797.81-4.115 1.47a.064.064 0 0 0-.03.027C.533 8.159-.32 11.749.099 15.284a.08.08 0 0 0 .028.056c1.732 1.277 3.415 2.052 5.077 2.568a.07.07 0 0 0 .076-.027c.391-.537.74-1.1 1.045-1.684a.07.07 0 0 0-.038-.098c-.552-.21-1.077-.462-1.584-.748a.07.07 0 0 1-.007-.117c.106-.08.213-.163.316-.246a.07.07 0 0 1 .073-.01c3.33 1.52 6.927 1.52 10.223 0a.07.07 0 0 1 .074.009c.104.083.21.166.317.247a.07.07 0 0 1-.006.117c-.507.286-1.032.538-1.584.748a.07.07 0 0 0-.038.098c.305.584.654 1.147 1.045 1.684a.07.07 0 0 0 .076.027c1.67-.516 3.354-1.291 5.077-2.568a.07.07 0 0 0 .028-.055c.417-3.451-.7-7.024-3.549-10.888a.061.061 0 0 0-.03-.028zM8.02 14.331c-.978 0-1.78-.892-1.78-1.988 0-1.096.788-1.988 1.78-1.988 1 0 1.8.9 1.78 1.988 0 1.096-.788 1.988-1.78 1.988zm7.96 0c-.978 0-1.78-.892-1.78-1.988 0-1.096.788-1.988 1.78-1.988 1 0 1.8.9 1.78 1.988 0 1.096-.78 1.988-1.78 1.988z"/>
                      </svg>
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
