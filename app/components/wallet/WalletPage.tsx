"use client";

import { useEffect, useState } from "react";
import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import * as bip32Factory from "bip32";
import { Keypair } from "@solana/web3.js";
import { ethers } from "ethers";
import { TronWeb } from 'tronweb';
import hdkey from "hdkey";
import * as ecc from '@bitcoinerlab/secp256k1';
import { derivePath } from "ed25519-hd-key";
import { SecureWallet } from "./secureWallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SendCrypto from "./SendCrypto";
import QRCode from "react-qr-code";
import CryptoChart from "../CryptoChart";
import BackupEncrypt from './BackupEncrypt';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DarkModeToggle } from '@/app/components/dark-mode-toggle';
import TickerSafeLogo from '../TickerSafeLogo';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Lock,
  Wallet,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  RefreshCw,
  User,
  Plus,
  Trash2,
  X,
  Settings,
  QrCode,
  History,
  Copy,
  Send,
  Fingerprint,
  ScanLine,
  Home,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  registerCredential,
  isWebAuthnSupported
} from "@/lib/webauthnCrypto";
import { authenticateWithBiometrics } from "@/lib/webauthnCrypto";
import { CRED_ID_KEY, USER_HANDLE_KEY, MASTER_PASSWORD_STORAGE_KEY, MASTER_PASSWORD_IV_KEY } from "@/lib/webauthnCrypto";
import { list } from "postcss";


type BalancesResponse = {
  [symbol: string]: {
    balance: number;
    usd?: number;
    price?: number;
    trc20_tokens?: number;
  };
};

interface WalletPageProps {
  mnemonic: string;
}

if (typeof window !== "undefined") {
  (window as any).Buffer = Buffer;
}

export default function WalletPage({ mnemonic: initialMnemonic }: WalletPageProps) {
  const [mode, setMode] = useState<"unlock" | "create" | "import" | "dashboard" | null>(null);
  const [masterPassword, setMasterPassword] = useState("");
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any>(null);
  const [balances, setBalances] = useState<BalancesResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mnemonic, setMnemonic] = useState(initialMnemonic || "");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [listAccounts, setListAccounts] = useState(false);
  const [newAccountId, setNewAccountId] = useState<string>("");
  const [lastOpenedAccountId, setLastOpenedAccountId] = useState<string | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [selectedBalance, setSelectedBalance] = useState<number | null>(null);
  const [selectedUSD, setSelectedUSD] = useState<number | null>(null);
  const [localPassword, setLocalPassword] = useState("");
  const [revealedMnemonic, setRevealedMnemonic] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [decryptedMnemonic, setDecryptedMnemonic] = useState<string | null>(null);
  const [showIntroState, setShowIntroState] = useState<boolean>(true);
  const [showIntro, setShowIntro] = useState(true);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [registered, setRegistered] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);

  // Load accounts on mount
  useEffect(() => {
    (async () => {
      const accs = await SecureWallet.listAccounts();
      console.log("Loaded accounts:", accs);
      setAccounts(accs);
      if (accs.length) {
        // If lastOpenedAccountId is not set, use the first account
        const id = lastOpenedAccountId != null && accs.includes(lastOpenedAccountId)
          ? lastOpenedAccountId
          : accs[0];
        setAccountId(id);
        setLastOpenedAccountId(id);
        setMode("unlock");
      } else {
        setAccountId(undefined);
        setLastOpenedAccountId(undefined);
        setMode("create");
      }
    })();
  }, []);

  // Helper to refresh account list
  const refreshAccounts = async () => {
    const accs = await SecureWallet.listAccounts();
    setAccounts(accs);
    if (accountId && !accs.includes(accountId)) {
      setAccountId(accs[0]);
    }
  };

  async function deriveAddresses(mnemonic: string) {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = bip32Factory.default(ecc);
    const btcRoot = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
    const btcChild = btcRoot.derivePath("m/84'/0'/0'/0/0");
    const btcAddress = bitcoin.payments.p2wpkh({
      pubkey: btcChild.publicKey,
      network: bitcoin.networks.bitcoin,
    }).address;

    const ethWallet = ethers.Wallet.fromMnemonic(mnemonic);
    const ethAddress = ethWallet.address;

    const solanaPath = "m/44'/501'/0'"; // Trust wallet compatible path 
    const derivedSeed = derivePath(solanaPath, seed.toString("hex")).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    const solAddress = keypair.publicKey.toBase58();

    // get the BNB, AVAX, Base
    const bnbAddress = ethWallet.address;
    const avaxAddress = ethWallet.address;
    const baseAddress = ethWallet.address;

    //get POL address
    const polAddress = ethWallet.address;

    // Tron
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
    });
    const root = hdkey.fromMasterSeed(seed);
    const derivationPath = "m/44'/195'/0'/0/0";
    const child = root.derive(derivationPath);
    const privateKeyHex = child?.privateKey?.toString("hex");
    const tronAddress = privateKeyHex ? tronWeb.address.fromPrivateKey(privateKeyHex) : "";

    const a = { BTC: btcAddress ?? "", ETH: ethAddress, SOL: solAddress, TRX: tronAddress.toString(), BNB: bnbAddress, AVAX: avaxAddress, BASE: baseAddress, POL: polAddress };
    setAddresses(a);
    return a;
  }

  async function fetchBalances(addrMap: Record<string, string>) {
    setRefreshing(true);
    try {
      const res = await fetch("/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addrMap),
      });
      if (!res.ok) throw new Error("Failed to fetch balances from API");
      const results: any = await res.json();
      console.log("Fetched balances:", results);
      const formatted: any = {};
      for (const [shortChain, value] of Object.entries(results)) {
        const data = value as { balance?: number; usd?: number };
        if (data && typeof data.balance === "number") {
          let displayBalance: string | number = data.balance;
          if (shortChain === "BTC") {
            displayBalance = (data.balance / 1e8).toFixed(8); // BTC from satoshis
          } else if (shortChain === "SOL") {
            displayBalance = data.balance;
          } else if (shortChain === "TRX") {
            displayBalance = data.balance;
          } else if (shortChain === "AVAX") {
            displayBalance = (data.balance / 1e9).toFixed(9); // AVAX from nAVAX
          } else if (shortChain === "BNB") {
            displayBalance = data.balance; // BNB from wei
          } else {
            displayBalance = data.balance.toFixed(6); // Default
          }
          formatted[shortChain] = {
            ...data,
            balance: Number(displayBalance),
          };
        } else {
          formatted[shortChain] = data;
        }
      }
      setBalances(formatted);
    } catch (e) {
      console.error("Balance fetch failed", e);
      setError("Failed to fetch balances.");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreate() {
    setMnemonic("");
    const phrase = bip39.generateMnemonic();
    setMnemonic(phrase);
  }

  // Save/Import use password to encrypt
  async function handleSave() {
    setLoading(true);
    setError(null);
    if (!masterPassword) {
      setError("Set a password to secure your wallets.");
      setLoading(false);
      return;
    }
    if (!mnemonic) {
      setError("No mnemonic to save.");
      setLoading(false);
      return;
    }
    try {
      await SecureWallet.saveMnemonic(mnemonic, masterPassword, false, newAccountId);
      await refreshAccounts();
      const addrMap = await deriveAddresses(mnemonic);
      await fetchBalances(addrMap);
      setMode("dashboard");
      setMnemonic("");
      setShowMnemonic(false);
      setMasterPassword("");
      setError(null);
    } catch (e) {
      console.error(e);
      setError((e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    setLoading(true);
    setError(null);
    if (!masterPassword) {
      setError("Set a password to secure your wallets.");
      setLoading(false);
      return;
    }
    if (!bip39.validateMnemonic(mnemonic)) {
      setError("Invalid mnemonic phrase.");
      setLoading(false);
      return;
    }
    await handleSave();
    setLoading(false);
  }

  async function handleDeleteAccount(id: string) {
    if (!window.confirm("Delete this account? This cannot be undone.")) return;
    await SecureWallet.clearMnemonic(id);
    await refreshAccounts();
    const remaining = await SecureWallet.listAccounts();
    if (remaining.length) {
      setAccountId(remaining[0]);
      setShowSettings(false);
      setMode("dashboard");
    } else {
      setMode("create");
    }
  }

  function logout() {
    setMasterPassword("");
    setMnemonic("");
    setBalances(null);
    setAddresses(null);
    location.reload();
  }

  // Unlock uses Password
  async function handleUnlock() {
    setLoading(true);
    setError(null);
    console.log("Last opened account ID:", lastOpenedAccountId);
    if (lastOpenedAccountId === undefined) {
      const accounts = await SecureWallet.listAccounts();
      setLastOpenedAccountId(accounts[0]);
    }
    try {
      if (!masterPassword) {
        setError("Enter password.");
        return;
      }
      const decrypted = await SecureWallet.loadMnemonic(lastOpenedAccountId, masterPassword);
      setDecryptedMnemonic(decrypted);
      if (!decrypted) {
        setError("Invalid password or wallet not found.");
        return;
      }
      setMnemonic(decrypted);
      const addrMap = await deriveAddresses(decrypted);
      await fetchBalances(addrMap);
      setMode("dashboard");
      setShowMnemonic(false);
      setError(null);
      setMnemonic("");
    } catch (e) {
      console.error(e);
      setError("Unlock failed.");
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async () => {
    if (!isWebAuthnSupported()) return alert("Not supported");

    const credential = await registerCredential(masterPassword, "Nope Wallet");
    setRegistered(true);

    if (credential) {
      setMessage("Credential registered successfully.");
      setTimeout(() => setMessage(null), 10000);
    }
  };

  const handleBioUnlock = async () => {
    const masterPassword = await authenticateWithBiometrics();
    if (masterPassword) {
      setLoading(true);
      setError(null);
      try {
        if (!masterPassword) {
          setError("Enter password.");
          return;
        }
        const decrypted = await SecureWallet.loadMnemonic(accountId, masterPassword);
        setMasterPassword(masterPassword);
        setDecryptedMnemonic(decrypted);
        if (!decrypted) {
          setError("Biometric authentication is not set up or failed.");
          return;
        }
        setMnemonic(decrypted);
        const addrMap = await deriveAddresses(decrypted);
        await fetchBalances(addrMap);
        setMode("dashboard");
        setShowMnemonic(false);
        setRegistered(true);
        setError(null);
        setMnemonic("");
      } catch (e) {
        console.error(e);
        setError("Unlock failed.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Biometric authentication failed or it is not set up.");
    }
  };

  const handleForget = () => {
    localStorage.removeItem(CRED_ID_KEY);
    localStorage.removeItem(USER_HANDLE_KEY);
    setLastOpenedAccountId(accountId);
    console.log("Last opened account ID set to:", accountId);
    setRegistered(false);
    setUnlocked(false);
    setMessage("Credential removed.");
    setTimeout(() => setMessage(null), 10000);
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen p-3">
      {mode !== "dashboard" && (
        <>
          {/* {accounts.length > 0 && AccountSelector} */}
          {mode === "unlock" && (
            <Card className="bg-gold-cardside w-full md:w-3/5 p-3 border border-gray-800 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="absolute right-8 top-2 text-gray-400 flex flex-row items-center gap-2">
                  <DarkModeToggle />
                  <Home size={16} className="ml-4 text-gray-600 cursor-pointer" onClick={() => {
                    setShowIntro(true);
                    location.reload();
                  }} />
                </div>
                <CardTitle className="flex-1 flex items-center justify-center gap-3 text-xl">
                  {mode === "unlock" ? "Unlock Wallet" : "Wallet Setup"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="card space-y-4 text-center flex flex-col items-center justify-center">
                  <div className="w-full md:w-2/3 mx-auto flex flex-col items-center justify-center">
                    <div className="flex w-full items-center gap-3">
                      <Input
                        type={showMnemonic ? "text" : "password"}
                        placeholder="Enter password"
                        value={masterPassword}
                        onChange={(e) => setMasterPassword(e.target.value)}
                        className="border-gray-700 w-full"
                      />
                      <Fingerprint onClick={handleBioUnlock} className="w-8 h-8" />
                    </div>
                    <Button
                      onClick={handleUnlock}
                      disabled={loading || !masterPassword}
                      className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin mr-2" size={16} />
                      ) : (
                        "Unlock Wallet"
                      )}
                    </Button>
                    <div className="w-full flex flex-col items-center mt-4">
                      <Button
                        variant="outline"
                        className="w-full mb-2"
                        onClick={() => {
                          setMode("create");
                          setMnemonic("");
                          setError(null);
                          setNewAccountId("");
                        }}
                      >
                        <Plus size={16} className="mr-2" /> Create New Wallet
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setMode("import");
                          setMnemonic("");
                          setError(null);
                          setNewAccountId("");
                        }}
                      >
                        <LogOut size={16} className="mr-2" /> Import Existing Wallet
                      </Button>
                      <div className="text-xs text-gray-500 mt-3">
                        <a href="#" onClick={() => setForgot(true)}>Forgot your password? You can <span className="font-semibold">reset</span> by removing all wallets from this device.</a>
                        <br />
                        {forgot && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              if (window.confirm("This will remove all wallets from this device. Make sure you have your recovery phrases backed up. Continue?")) {
                                //
                                localStorage.clear();
                                setAccounts([]);
                                setAccountId(undefined);
                                setLastOpenedAccountId(undefined);
                                setMode("create");
                                setMnemonic("");
                                setError(null);
                              }
                            }}
                          >
                            Remove All Wallets
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center mt-4">
                  {error && <div className="text-red-400 text-sm mt-3 text-center">{error}</div>}
                  <TickerSafeLogo size={40} letterSpacing={-4} className="mx-auto mt-6 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
      {(mode === "create" || mode === "import") && (
        <Card
          className="bg-gold-cardside w-full md:w-3/5 p-3 border border-gray-800 rounded-2xl shadow-xl backdrop-blur-md"
        >
          <CardHeader className="flex flex-row items-center justify-between mt--[-20px]">
            <TickerSafeLogo showText={false} colorClass='text-zinc-600 dark:text-gray-400' />

            <CardTitle className="flex-1 flex items-center justify-center gap-2 text-xl">
              {/* {mode === "create" ? <Shield size={20} /> : <Lock size={20} />} */}
            </CardTitle>
            <div className="flex items-center ml-auto gap-2">
              <DarkModeToggle />
              <X
                size={22}
                className="text-gray-600 cursor-pointer"
                onClick={async () => {
                  const accs = await SecureWallet.listAccounts();
                  if (accs.length > 0) {
                    setListAccounts(true);
                    setMnemonic("");
                    setError(null);
                    setMode(null);
                  } else {
                    setShowIntroState(true);
                    setMode(null);
                    location.reload();
                  }
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="w-full h-full p-0 m-0">
            <div className="flex justify-center items-center my-6">
              <span className="text-lg font-semibold">
                {mode === "create" ? "Create New Wallet" : "Import Wallet"}
              </span>
            </div>
            <div className="bg-gold-card space-y-4 text-center p-4 mt-16">
              {mode === "create" && (
                <p className="bg-gold-cardback p-4 text-sm text-gray-700 dark:text-gray-200">Start with making your first account. Prepare a pen and paper to securely write down your recovery phrase.</p>
              )}
              <Input
                placeholder="Account name e.g. Account 1"
                value={newAccountId}
                onChange={e => setNewAccountId(e.target.value)}
                className="border-gray-700 "
              />
              {mode === "create" && !mnemonic && (
                <div className="flex flex-col items-center">
                  <Button
                    onClick={handleCreate}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 "
                  >
                    <Plus size={16} className="mr-2" /> Create New Wallet
                  </Button>
                  <Button className="w-full md:w-auto mt-2" onClick={() => setMode("import")}>
                    <LogOut size={16} className="mr-2" /> Import Existing Wallet
                  </Button>
                </div>
              )}
              {(mnemonic || mode === "import") && (
                <>
                  {mode === "import" && (
                    <Input
                      placeholder="Enter mnemonic phrase"
                      value={mnemonic}
                      onChange={e => setMnemonic(e.target.value)}
                      className="border-gray-700 "
                    />
                  )}
                  {mode === "create" && (
                    <p className="bg-gold-cardback p-4 text-gray-700 text-sm dark:text-gray-200">
                      This is your wallet recovery phrase. Write it down and keep it in a safe place.
                    </p>
                  )}
                  <div className="w-full grid grid-cols-3 gap-2">
                    {mnemonic.split(" ").map((word, idx) => (
                      <div key={idx} className="flex items-center gap-1 rounded px-2 py-1 text-sm md:text-lg">
                        <span className="text-gray-400">{idx + 1}.</span>
                        <span className="font-mono">{word}</span>
                      </div>
                    ))}
                  </div>
                  <p className="bg-gold-cardback p-4 text-gray-700 text-sm dark:text-gray-200">
                    You will need the password to unlock your wallet and recover your accounts.
                    If you forget the password we cannot help you.
                    If you lose your recovery phrase, your assets will be lost forever and we cannot help you.
                  </p>
                      {typeof window !== "undefined" && isWebAuthnSupported() && localStorage.getItem(CRED_ID_KEY) ? (
                        <div className="flex items-center gap-2">
                          <Input
                      type={showMnemonic ? "text" : "password"}
                      placeholder="Password (used for all your accounts)"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      className="border-gray-700 dark:border-gray-400 pr-10"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-10 top-2 text-gray-400"
                      tabIndex={-1}
                      type="button"
                      onClick={() => setShowMnemonic((prev) => !prev)}
                    >
                      {showMnemonic ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={handleBioUnlock}
                        >
                          <Fingerprint size={16} />
                          Unlock with Biometrics
                        </Button> 
                          
                        </div>
                      ) : (
                        <>
                        <div className="relative flex items-center">
                    <Input
                      type={showMnemonic ? "text" : "password"}
                      placeholder="Password (used for all your accounts)"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      className="border-gray-700 dark:border-gray-400 pr-10"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-10 top-2 text-gray-400"
                      tabIndex={-1}
                      type="button"
                      onClick={() => setShowMnemonic((prev) => !prev)}
                    >
                      {showMnemonic ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                      <input
                      type="checkbox"
                      onChange={async (e) => {
                        if (e.target.checked) {
                        await handleRegister();
                        } else {
                        handleForget();
                        }
                      }}
                      id="biometric-enable"
                      className="accent-blue-600 w-4 h-4"
                      disabled={loading}
                      />
                      <label htmlFor="biometric-enable" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                      Enable Biometrics
                      </label>
                  </div>
                      </>
                      )}
                  <Button
                    onClick={mode === "import" ? handleImport : handleSave}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 "
                  >
                    {loading ? (
                      <Loader2 className="animate-spin mr-2" size={16} />
                    ) : mode === "import" ? "Import Wallet" : "Save Wallet"}
                  </Button>
                </>
              )}
              {error && <div className="text-red-400 text-sm mt-3">{error}</div>}
            </div>
            <div className="h-16" />
          </CardContent>
        </Card>
      )}

      {showSettings && (
        <Card className="bg-gold-cardside w-full sm:max-w-none sm:p-0 border border-gray-800 backdrop-blur-md rounded-none">
          <CardContent className="card min-h-[700px] p-0 space-y-5">
            <div className="flex justify-between items-center p-4">
              {/* Far left aligned */}
              <div className="flex-1 flex justify-start items-center">
                <span className="font-semibold text-2xl">Settings</span>
              </div>
              {/* Middle aligned */}
              <div className="flex-1 flex justify-center items-center">
                {/* Place your middle content here, e.g. a title */}

              </div>
              {/* Right aligned */}
              <div className="flex-1 flex justify-end items-center">
                <X size={22} onClick={() => { setShowSettings(false); setRevealedMnemonic(null); }} className="text-gray-600 cursor-pointer" />

              </div>
            </div>
            <div className="space-y-6 p-4 mt-4">
              {/* 1. List accounts with remove option */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Account</h4>
                <ul className="space-y-2">
                  {accountId && (
                    <li className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                      <span className="font-mono text-sm">
                        {accountId ? accountId.charAt(0).toUpperCase() + accountId.slice(1) : "Default"}
                      </span>
                      <div className="flex items-center gap-2">
                        {accounts.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => handleDeleteAccount(accountId)}
                            title="Delete account"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </li>
                  )}
                </ul>
              </div>
              {/* Enable and Disable showIntro - Default Page login or intro */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">First Page</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant={localStorage.getItem("showIntro") === "false" ? "secondary" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => {
                      const current = localStorage.getItem("showIntro");
                      if (current === "true") {
                        localStorage.setItem("showIntro", "false");
                        setShowIntroState(false);
                      } else {
                        localStorage.setItem("showIntro", "true");
                        setShowIntroState(true);
                      }
                    }}
                  >
                    <Eye size={16} />
                    {showIntroState ? "Homepage" : "Login Screen"}
                  </Button>
                  <span className="ml-2 text-xs text-gray-500">
                    ({typeof window !== "undefined" && localStorage.getItem("showIntro") === "false"
                      ? "Now Login screen appears first"
                      : "Now Homepage appears after login"})
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Enable or disable the homepage on login.</p>
              </div>

              {/* 2. Enable fingerprint login option */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Biometric Login</h4>

                {typeof window !== "undefined" && localStorage.getItem(CRED_ID_KEY) ? (
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="destructive" onClick={handleForget}>
                      Remove Biometric
                    </Button> <span className="text-[12px] text-gray-300 dark:text-gray-500">Enabled</span>
                  </div>
                ) : (
                  <Button type="button" onClick={handleRegister}>
                    Enable Biometric Login
                  </Button>
                )}

                {message && <div className="text-green-400 text-sm mt-2">{message}</div>}
              </div>

              {/* 4. Show mnemonic for selected account */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Backup Phrase</h4>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Input
                      type={showMnemonic ? "text" : "password"}
                      placeholder="Enter password"
                      value={localPassword}
                      onChange={e => setLocalPassword(e.target.value)}
                      className="border-gray-700"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-2 text-gray-400"
                      tabIndex={-1}
                      type="button"
                      onClick={() => setShowMnemonic((prev) => !prev)}
                    >
                      {showMnemonic ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <Button
                    className="w-fit"
                    onClick={async () => {
                      setLocalLoading(true);
                      setLocalError(null);
                      try {
                        if (!localPassword) {
                          setLocalError("Enter password.");
                          return;
                        }
                        const decrypted = await SecureWallet.loadMnemonic(accountId, localPassword);
                        if (!decrypted) {
                          setLocalError("Invalid password.");
                          return;
                        }
                        setRevealedMnemonic(decrypted);
                        setLocalPassword(""); // Clear after use
                      } catch (e) {
                        setError("Failed to unlock mnemonic.");
                        setLocalError("Failed to unlock mnemonic.");
                      } finally {
                        setLocalLoading(false);
                      }
                    }}
                    disabled={localLoading || !localPassword}
                  >
                    {localLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : "Reveal Phrase"}
                  </Button>
                  {localError && <div className="text-red-400 text-xs">{localError}</div>}
                  {revealedMnemonic && (
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs bg-black text-white rounded p-3">
                      {revealedMnemonic.split(" ").map((word, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="text-gray-400">{idx + 1}.</span>
                          <span className="font-mono">{word}</span>
                        </div>
                      ))}
                      <Button className="w-auto text-sm" onClick={() => setRevealedMnemonic(null)}>
                        Hide Phrase
                      </Button>
                    </div>
                  )}
                </div>
              </div>


              {/* 4. Backup/Restore LocalStorage */}
              <h4 className="font-semibold mb-2 text-lg">Encrypted Wallet Backup & Restore</h4>
              <BackupEncrypt />


            </div>
          </CardContent>
        </Card>
      )}

      {showAccount && (
        <Card className="bg-gold-cardside w-full sm:max-w-none sm:p-0 border border-gray-800 backdrop-blur-md rounded-none">
          <CardContent className="card min-h-[700px] p-0 space-y-5">
            <div className="flex items-center justify-between mb-4 p-4">
              <div className="flex items-center">
                <img
                  src={
                    {
                      BTC: "/cryptos/bitcoin-btc-logo.svg",
                      ETH: "/cryptos/ethereum-eth-logo.svg",
                      BNB: "/cryptos/bnb-bnb-logo.svg",
                      AVAX: "/cryptos/avalanche-avax-logo.svg",
                      SOL: "/cryptos/solana-sol-logo.svg",
                      TRX: "/cryptos/tron.svg",
                      BASE: "/cryptos/base-logo.svg",
                      POL: "/cryptos/polygon-matic-logo.svg",
                    }[selectedSymbol] || "/cryptos/walletconnect-icon.svg"
                  }
                  alt={selectedSymbol}
                  title={selectedSymbol}
                  className="w-8 h-8 mr-2 inline-block align-middle"
                />
                <span className="align-middle text-lg font-semibold">{selectedSymbol}</span>
              </div>
              <X size={22} onClick={() => { setShowAccount(false); }} className="text-gray-600 cursor-pointer" />
            </div>
            <div className="flex flex-col items-center mt-2 gap-1">
              <div className="w-full md:w-1/2 text-[8px] font-body p-2"><CryptoChart cryptoId={selectedSymbol} /></div>
            </div>
            <div className="flex items-center w-full px-6 py-4 border-b-2 border-red-500">
              <Wallet className="mr-2 text-gray-500" />
              <span className="text-lg font-semibold">Holdings</span>
            </div>
            <div className="flex flex-col items-center mt-2 gap-1">
              <div className="flex items-center gap-2 max-h-[50px] min-h-[50px]">
                <span
                  className="text-lg text-gray-900 dark:text-white font-semibold"
                  style={{ minWidth: selectedBalance !== null ? `${selectedBalance.toString().length}ch` : "6ch", display: "inline-block" }}
                >
                  <span className="mr-2">{selectedSymbol}</span>
                  {showMnemonic ? (
                    selectedBalance !== null ? selectedBalance : "Loading..."
                  ) : (
                    // Render same number of dots as balance digits for consistent width
                    selectedBalance !== null
                      ? "•".repeat(selectedBalance.toString().length)
                      : "••••••"
                  )}
                </span>
                <button
                  type="button"
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowMnemonic((prev) => !prev)}
                >
                  {showMnemonic ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-md text-gray-500">
                {showMnemonic && selectedUSD !== null ? `$${selectedUSD.toFixed(2)}` : ""}
              </div>
              <div className="text-xs text-gray-400">Balance</div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-stretch gap-2">
              <Button className="w-auto ml-2 mr-2" onClick={() => setShowQR(true)}>
                <QrCode className="mr-2 h-4 w-4" /> Receive
              </Button>


              <Button className="w-auto ml-2 mr-2" onClick={() => setShowSendModal(true)}>
                <Send className="ml-2 mr-2 h-4 w-4" /> Send
              </Button>

              <Button
                className="w-auto ml-2 mr-2"
                asChild
              >
                <a
                  href={
                    selectedSymbol === "BTC"
                      ? `https://www.blockchain.com/btc/address/${addresses[selectedSymbol]}`
                      : selectedSymbol === "ETH"
                        ? `https://etherscan.io/address/${addresses[selectedSymbol]}`
                        : selectedSymbol === "BNB"
                          ? `https://bscscan.com/address/${addresses[selectedSymbol]}`
                          : selectedSymbol === "TRX"
                            ? `https://tronscan.org/#/address/${addresses[selectedSymbol]}`
                            : selectedSymbol === "SOL"
                              ? `https://solscan.io/account/${addresses[selectedSymbol]}`
                              : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <History className="ml-2 mr-2 h-4 w-4" /> Activity
                </a>
              </Button>

            </div>
            <div className="h-16" />
            {showSendModal && (
              <SendCrypto
                accountId={accountId || ""}
                chain={selectedSymbol}
                fromAddress={addresses[selectedSymbol]}
                balance={selectedBalance || 0}
                onSuccess={(txid) => {
                  console.log("TX success:", txid);
                  fetchBalances(addresses);
                }}
                onClose={() => setShowSendModal(false)}
              />
            )}
            <Dialog open={showQR} onOpenChange={setShowQR}>
              <DialogContent className="bg-gold-cardside w-full md:w-4/5 text-center text-black dark:text-white">
                <DialogHeader>
                  <DialogTitle>
                    Receive {selectedSymbol}
                  </DialogTitle>
                  <DialogDescription>
                    Only send {selectedSymbol} ({selectedSymbol.toUpperCase() === "EVM" ? "including ERC20 tokens" : "native coin only"}) to this address.
                    <br />
                    Sending unsupported coins or tokens may result in permanent loss.
                    <br />
                    <span className="font-semibold">
                      Network: {selectedSymbol}
                    </span>
                  </DialogDescription>

                </DialogHeader>
                {selectedSymbol && (
                  <div className="flex flex-col items-center gap-4 mt-4">
                    <QRCode value={addresses[selectedSymbol]} size={185} />
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Copy address"
                      onClick={() => {
                        navigator.clipboard.writeText(addresses[selectedSymbol]);
                      }}
                    >
                      <Copy size={32} />
                    </button>
                    <div className="text-xs font-mono break-all">{addresses[selectedSymbol]}</div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {listAccounts && (
        <Card className="bg-gold-cardside w-full sm:max-w-none sm:p-0 border border-gray-800 backdrop-blur-md rounded-none">
          <CardContent className="card min-h-[700px] p-0 space-y-5">
            <div className="flex justify-between items-center p-4">
              {/* Far left aligned */}
              <div className="flex-1 flex justify-start items-center">
                <span className="font-semibold text-2xl">Accounts</span>
              </div>
              {/* Middle aligned */}
              <div className="flex-1 flex justify-center items-center">
                {/* Place your middle content here, e.g. a title */}

              </div>
              {/* Right aligned */}
              <div className="flex-1 flex justify-end items-center">
                <X size={22} onClick={() => { setListAccounts(false); setMode("dashboard") }} className="text-gray-600 cursor-pointer" />

              </div>
            </div>
            <div className="space-y-6 p-4 mt-4">
              <ul className="space-y-2">
                {accounts.map(acc => (
                  <li
                    key={acc}
                    className={`flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded px-3 py-2 cursor-pointer ${acc === accountId ? "font-bold" : ""}`}
                    onClick={async () => {
                      if (acc !== accountId) {
                        setAccountId(acc);
                        setLastOpenedAccountId(acc);
                        setListAccounts(false);
                        setError(null);
                        setLoading(true);
                        try {
                          const decrypted = await SecureWallet.loadMnemonic(acc, masterPassword);
                          if (!decrypted) {
                            setError("Invalid password or wallet not found.");
                            setAddresses(null);
                            setBalances(null);
                            setMnemonic("");
                          } else {
                            setMnemonic(decrypted);
                            const addrMap = await deriveAddresses(decrypted);
                            await fetchBalances(addrMap);
                          }
                        } catch (e) {
                          setError("Failed to load account.");
                          setAddresses(null);
                          setBalances(null);
                          setMnemonic("");
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                  >
                    <span className="font-mono text-sm">
                      {acc === undefined
                        ? "Default"
                        : acc.charAt(0).toUpperCase() + acc.slice(1)}
                    </span>
                    <div className="flex items-center gap-2">
                      {accounts.length > 1 && (
                        <Settings size={16}
                          onClick={e => {
                            e.stopPropagation();
                            setAccountId(acc);
                            setShowSettings(true);
                            setListAccounts(false);
                          }}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col justify-center items-center gap-2 mt-4">
                <Button
                  onClick={() => { setMode("create"); setListAccounts(false); }}
                  className="w-full md:w-auto flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Create New Wallet
                </Button>
                <Button
                  onClick={() => { setMode("import"); setListAccounts(false); }}
                  className="w-full md:w-auto flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Import Existing Wallet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "dashboard" && addresses && balances && !showSettings && !showAccount && !listAccounts && (
        <Card className="bg-gold-cardside w-full max-w-none p-0 border border-gray-800 backdrop-blur-md rounded-none">
          {showSendModal && (
            <SendCrypto
              accountId={accountId || ""}
              chain={selectedSymbol}
              fromAddress={addresses[selectedSymbol]}
              balance={selectedBalance || 0}
              onSuccess={(txid) => {
                console.log("TX success:", txid);
                fetchBalances(addresses);
              }}
              onClose={() => setShowSendModal(false)}
            />
          )}
          <CardContent className="card space-y-5 p-0">
            <div className="flex justify-between items-center mb-2">
              {/* Far left aligned */}
              <div className="flex-1 flex justify-start items-center hidden md:block">
                <TickerSafeLogo showText={false} colorClass='text-zinc-600 dark:text-gray-400' />
              </div>
              {/* Middle aligned */}
              <div className="flex-1 flex justify-center items-center">
                {/* Place your middle content here, e.g. a title */}
                <div className="relative w-full p-4">
                  <Button
                    variant="outline"
                    onClick={() => setListAccounts(true)}
                    className="w-full h-full min-h-[30px] text-sm md:text-lg font-semibold border border-black dark:border-gray-600 rounded pr-8 flex justify-between items-center"
                  >
                    {accountId
                      ? (accountId.charAt(0).toUpperCase() + accountId.slice(1))
                      : "Default"}
                    <span className="ml-2">&#9662;</span>
                  </Button>
                </div>
              </div>
              {/* Far right aligned */}
              <div className="flex-1 flex justify-end items-center mr-2">
                {/* Token quick-send button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2">
                      <ScanLine size={32} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Scan and Send</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.entries(balances)
                      .filter(([symbol, data]) => (data.balance ?? 0) > 0 || (symbol === "TRX" && data.trc20_tokens && Number(data.trc20_tokens) > 0))
                      .map(([symbol, data]) => (
                        <DropdownMenuItem
                          key={symbol}
                          onSelect={() => {
                            setSelectedSymbol(symbol);
                            setShowAccount(false);
                            setSelectedBalance(data.balance ?? null);
                            setSelectedUSD(data.usd ?? null);
                            setDecryptedMnemonic(decryptedMnemonic);
                            setShowSendModal(true);
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <img
                              src={
                                {
                                  BTC: "/cryptos/bitcoin-btc-logo.svg",
                                  ETH: "/cryptos/ethereum-eth-logo.svg",
                                  BNB: "/cryptos/bnb-bnb-logo.svg",
                                  AVAX: "/cryptos/avalanche-avax-logo.svg",
                                  SOL: "/cryptos/solana-sol-logo.svg",
                                  TRX: "/cryptos/tron.svg",
                                  BASE: "/cryptos/base-logo.svg",
                                  POL: "/cryptos/polygon-matic-logo.svg",
                                }[symbol] || "/cryptos/walletconnect-icon.svg"
                              }
                              alt={symbol}
                              className="w-4 h-4"
                            />
                            <span>{symbol}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              {symbol === "TRX" && data.trc20_tokens && Number(data.trc20_tokens) > 0
                                ? `${Number(data.trc20_tokens).toFixed(2)} USDT`
                                : data.balance?.toFixed(4)}
                            </span>
                          </span>
                        </DropdownMenuItem>
                      ))}
                    {/* Special case for USDT (TRC20) */}
                    {balances.TRX && balances.TRX.trc20_tokens && Number(balances.TRX.trc20_tokens) > 0 && (
                      <DropdownMenuItem
                        key="USDT_TRC20"
                        onSelect={() => {
                          setSelectedSymbol("TRX");
                          setShowAccount(true);
                          setSelectedBalance(Number(balances.TRX.trc20_tokens));
                          setSelectedUSD(Number(balances.TRX.trc20_tokens));
                          setDecryptedMnemonic(decryptedMnemonic);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <img src="/cryptos/tether-usdt-logo.svg" alt="USDT" className="w-4 h-4" />
                          <span>USDT (TRC20)</span>
                          <span className="ml-2 text-xs text-gray-500">
                            {Number(balances.TRX.trc20_tokens).toFixed(2)}
                          </span>
                        </span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Settings size={22} onClick={() => setShowSettings(true)} className="mr-2 text-gray-600 cursor-pointer" />
                <DarkModeToggle />
                <Lock size={22} onClick={logout} className="text-gray-600 cursor-pointer" />
              </div>
            </div>
            {/* Total USD balance */}
            <div className="flex justify-center items-center mb-4 px-2">
              <span className="text-2xl font-bold ">
                $
                {Object.values(balances)
                  .reduce((sum, data) => {
                    const usd = data.usd ?? 0;
                    const usdt = data.trc20_tokens ? Number(data.trc20_tokens) : 0;
                    return sum + usd + usdt;
                  }, 0)
                  .toFixed(2)}
              </span>
              <Button
                variant="ghost"
                onClick={() => fetchBalances(addresses)}
                className="text-gray-600 hover:"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </Button>
            </div>
            {Object.entries(balances)
              .sort(([, a], [, b]) => (b.usd ?? 0) - (a.usd ?? 0))
              .flatMap(([symbol, data]) => {
                // For TRX, also show USDT (TRC20) as a separate row if present
                if (symbol === "TRX" && data.trc20_tokens) {
                  return [
                    // TRX row
                    (
                      <div
                        key={symbol}
                        onClick={() => { setSelectedSymbol(symbol); setShowAccount(true); setSelectedBalance(data.balance ?? null); setSelectedUSD(data.usd ?? null); setDecryptedMnemonic(decryptedMnemonic) }}
                        className="bg-gold-cardback p-3 border border-gray-700"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <img
                              src="/cryptos/tron.svg"
                              alt="TRX"
                              title="TRX"
                              className="w-5 h-5 mr-2 inline-block align-middle"
                            />
                            <span className="align-middle font-semibold">TRX</span>
                            <p className="text-sm text-gray-400">
                              {data.price && (
                                <span className="text-[12px] text-gray-400">
                                  @ ${data.price.toFixed(2)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <p className="text-lg font-semibold ">
                              {data.balance?.toFixed(6)}
                            </p>
                            <p className="text-[12px] text-gray-400">
                              {data.usd && (
                                <span>
                                  ≈ ${data.usd.toFixed(2)} USD
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 break-all mt-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="p-1 text-gray-500 hover:text-gray-700 h-4 w-4 mr-2"
                            title="Copy address"
                            onClick={e => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(addresses[symbol]);
                            }}
                          >
                            <Copy size={16} />
                          </Button>
                          <span className="font-mono">
                            {addresses[symbol]
                              ? `${addresses[symbol].slice(0, 6)}...${addresses[symbol].slice(-6)}`
                              : ""}
                          </span>
                        </p>
                      </div>
                    ),
                    // USDT (TRC20) row
                    (
                      <div
                        key="USDT_TRC20"
                        onClick={() => { setSelectedSymbol(symbol); setShowAccount(true); setSelectedBalance(Number(data.trc20_tokens) ?? null); setSelectedUSD(Number(data.trc20_tokens) ?? null); setDecryptedMnemonic(decryptedMnemonic) }}
                        className="bg-gold-cardback p-3 border border-gray-700"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <img
                              src="/cryptos/tether-usdt-logo.svg"
                              alt="USDT"
                              title="USDT (TRC20)"
                              className="w-5 h-5 mr-2 inline-block align-middle"
                            />
                            <span className="align-middle font-semibold">
                              USDT <sup className="text-[8px] text-gray-400 align-super">
                                <img src="/cryptos/tron.svg" alt="TRC20" className="inline-block w-3 h-3" />
                              </sup>
                            </span>
                            <p className="text-sm text-gray-400">
                              {/* No price for USDT, it's always $1 */}
                              <span className="text-[12px] text-gray-400">
                                @ $1.00
                              </span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <p className="text-lg font-semibold ">
                              {Number(data.trc20_tokens).toFixed(2)}
                            </p>
                            <p className="text-[12px] text-gray-400">
                              <span>
                                ≈ ${Number(data.trc20_tokens).toFixed(2)} USD
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 break-all mt-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="p-1 text-gray-500 hover:text-gray-700 h-4 w-4 mr-2"
                            title="Copy address"
                            onClick={e => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(addresses[symbol]);
                            }}
                          >
                            <Copy size={16} />
                          </Button>
                          <span className="font-mono">
                            {addresses[symbol]
                              ? `${addresses[symbol].slice(0, 6)}...${addresses[symbol].slice(-6)}`
                              : ""}
                          </span>
                        </p>
                      </div>
                    ),
                  ];
                }
                // Default row for all other tokens
                return (
                  <div
                    key={symbol}
                    onClick={() => { setSelectedSymbol(symbol); setShowAccount(true); setSelectedBalance(data.balance ?? null); setSelectedUSD(data.usd ?? null); setDecryptedMnemonic(decryptedMnemonic) }}
                    className="bg-gold-cardback p-3 border border-gray-700"
                  >
                    <div className="flex justify-between items-center cursor-pointer">
                      <div>
                        <img
                          src={
                            {
                              BTC: "/cryptos/bitcoin-btc-logo.svg",
                              ETH: "/cryptos/ethereum-eth-logo.svg",
                              BNB: "/cryptos/bnb-bnb-logo.svg",
                              AVAX: "/cryptos/avalanche-avax-logo.svg",
                              SOL: "/cryptos/solana-sol-logo.svg",
                              TRX: "/cryptos/tron.svg",
                              BASE: "/cryptos/base-logo.svg",
                              POL: "/cryptos/polygon-matic-logo.svg",
                            }[symbol] || "/cryptos/walletconnect-icon.svg"
                          }
                          alt={symbol}
                          title={symbol}
                          className="w-5 h-5 mr-2 inline-block align-middle"
                        />
                        <span className="align-middle font-semibold text-lg">{symbol}</span>
                        <p className="text-sm text-gray-400">
                          {data.price && (
                            <span className="text-[12px] text-gray-400">
                              @ ${data.price.toFixed(2)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-lg font-semibold ">
                          {data.balance?.toFixed(6)}
                        </p>
                        <p className="text-[12px] text-gray-400">
                          {data.usd && (
                            <span>
                              ≈ ${data.usd.toFixed(2)} USD
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 break-all mt-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="p-1 text-gray-500 hover:text-gray-700 h-4 w-4 mr-2"
                        title="Copy address"
                        onClick={e => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(addresses[symbol]);
                        }}
                      >
                        <Copy size={16} />
                      </Button>
                      <span className="font-mono">
                        {addresses[symbol]
                          ? `${addresses[symbol].slice(0, 6)}...${addresses[symbol].slice(-6)}`
                          : ""}
                      </span>
                    </p>
                  </div>
                );
              })}

            <Button
              onClick={logout}
              className="w-auto mt-4"
            >
              <Lock size={16} className="mr-2" /> Lock Wallet
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}