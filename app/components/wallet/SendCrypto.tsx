"use client";

import React, { useState } from "react";
import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import * as bip32Factory from "bip32";
import hdkey from "hdkey";
import * as ecc from '@bitcoinerlab/secp256k1';
import nacl from "tweetnacl";
import bs58 from "bs58";
import * as btc from "bitcoinjs-lib"; // BTC optional for future
import { ethers } from "ethers";
import { Keypair, Connection, Transaction, SystemProgram, sendAndConfirmTransaction, PublicKey } from "@solana/web3.js";
import { SecureWallet } from "./secureWallet";
import { TronWeb } from "tronweb";
import { derivePath } from "ed25519-hd-key";
import WalletQRScanner from "./QRScanner";

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
  QrCodeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

const bip32 = bip32Factory.default(ecc);

interface Props {
  accountId: string;
  chain: string; // "ETH", "BNB", "AVAX", "BASE", "SOL", "TRX"
  fromAddress: string;
  balance: number;
  onSuccess?: (txid: string) => void;
  onClose?: () => void;
}

export default function SendCrypto({
  accountId,
  chain,
  fromAddress,
  balance,
  onSuccess,
  onClose,
}: Props) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState(""); // Assume we get this securely
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [successTransfer, setSuccessTransfer] = useState(false);
  const [waiting, setWaiting] = useState(false);
  // ----------------------------------------
  // PRIVATE KEY DERIVATION (ALL CHAINS)
  // ----------------------------------------


  async function getMnemonic(masterPassword: string) {
    const decrypted = await SecureWallet.loadMnemonic(accountId, masterPassword);
    setMnemonic(decrypted || "");
    return decrypted;
  }

  async function derivePrivateKey() {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    

    if (["ETH", "BNB", "AVAX", "BASE", "POL"].includes(chain)) {
      const wallet = ethers.Wallet.fromMnemonic(mnemonic);
      return wallet.privateKey;
    }

    if (chain === "SOL") {
      const path = "m/44'/501'/0'";
      const derived = derivePath(path, seed.toString("hex")).key;
      const kp = Keypair.fromSeed(derived);
      return kp;
    }

    if (chain === "TRX") {
      const root = bip32.fromSeed(seed);
      const child = root.derivePath("m/44'/195'/0'/0/0");
      const privateKey = Buffer.from(child.privateKey!).toString("hex");
      return privateKey;
    }

    throw new Error("Unsupported chain in derivation: " + chain);
  }

  // ----------------------------------------
  // SEND EVM
  // ----------------------------------------
  // Send the maximum possible amount minus gas fee for EVM chains
  async function sendEvm(privateKey: string) {
    const rpc =
      chain === "ETH"
        ? `https://mainnet.infura.io/v3/1751485a9c7a4e58b1a2287d24372bdf`
        : chain === "BNB"
          ? "https://bsc-dataseed.binance.org"
          : chain === "AVAX"
            ? "https://api.avax.network/ext/bc/C/rpc"
            : chain === "BASE"
              ? "https://mainnet.base.org"
              : chain === "POL"
                ? "https://polygon-rpc.com"
                : null;

    if (!rpc) throw new Error("Invalid EVM chain");

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(privateKey, provider);

    // Fetch the correct chainId from the provider
    const { chainId } = await provider.getNetwork();

    let valueToSend = ethers.utils.parseEther(amount);

    // If user wants to send "max", deduct gas fee from balance
    if (
      amount === balance.toString() ||
      Math.abs(Number(amount) - balance) < 1e-8 // floating point tolerance
    ) {
      const gasPrice = await provider.getGasPrice();
      // Estimate gas limit for a simple transfer
      const estimate = await provider.estimateGas({
        to: recipient,
        from: fromAddress,
        value: ethers.utils.parseEther(amount),
      });
      const fee = gasPrice.mul(estimate);

      const walletBalance = await provider.getBalance(fromAddress);

      // Only send the max possible after fee
      if (walletBalance.gt(fee)) {
        valueToSend = walletBalance.sub(fee);
      } else {
        throw new Error("Insufficient balance for gas fee");
      }
    }

    console.log(`Sending ${ethers.utils.formatEther(valueToSend)} ${chain} from ${fromAddress} to ${recipient} on chainId ${chainId}`);

    const tx = await signer.sendTransaction({
      to: recipient,
      value: valueToSend,
      chainId,
    });

    return tx.hash;
  }

  // ----------------------------------------
  // SEND SOLANA
  // ----------------------------------------
  // Instead of sending directly from frontend, call backend API
  async function sendSolana(keypair: Keypair) {
    const res = await fetch("/api/solana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mnemonic,
        to: recipient,
        amount,
        accountIndex: 0,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Solana send failed");
    }
    const data = await res.json();
    return data.txid;
  }

  // ----------------------------------------
  // SEND TRON
  // ----------------------------------------
  async function sendTron(privateKey: string) {
    const tronWeb = new TronWeb({
      fullHost: "https://api.trongrid.io",
      privateKey,
    });

    const tx = await tronWeb.transactionBuilder.sendTrx(
      recipient,
      Number(amount) * 1e6,
      fromAddress
    );

    const signed = await tronWeb.trx.sign(tx);
    const broadcast = await tronWeb.trx.sendRawTransaction(signed);

    if (!broadcast.txid) throw new Error("TRX send failed");

    return broadcast.txid;
  }

  // ----------------------------------------
  // MASTER SEND FUNCTION
  // ----------------------------------------
  async function handleSend() {
    try {
      setLoading(true);
      setError(null);

      if (!recipient || !amount) {
        setError("Recipient and amount required.");
        return;
      }

      if (!mnemonic) {
        setError("Mnemonic is required for Solana sending.");
        return;
      }

      let resultTxid = "";

      if (["ETH", "BNB", "AVAX", "BASE"].includes(chain)) {
        // existing EVM send
        const pk = await derivePrivateKey();
        resultTxid = await sendEvm(pk as string);
        setSuccessTransfer(true);
        setWaiting(false);       
      } else if (chain === "SOL") {
        // --- NEW SOL SEND ---
        const res = await fetch("/api/solana", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mnemonic,        // server derives keypair
            to: recipient,
            amount: amount,
            accountIndex: 0, // optional: supports multiple accounts
          }),
        });

        if (!res.ok) {
          setWaiting(false);
          const err = await res.json();
          throw new Error(err.error || "Solana send failed");
        }

        const data = await res.json();
        resultTxid = data.txid;
        setSuccessTransfer(true);
        setWaiting(false);
      } else if (chain === "TRX") {
        const pk = await derivePrivateKey();
        resultTxid = await sendTron(pk as string);
        setSuccessTransfer(true);
        setWaiting(false);
      } else {
        throw new Error("Unsupported chain for sending.");
      }

      setTxid(resultTxid);
      onSuccess?.(resultTxid);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Send failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    try {
      const decrypted = await SecureWallet.loadMnemonic(accountId, masterPassword);

      if (!decrypted) {
        setPasswordError("Invalid password. Try again.");
        return;
      }
      setMnemonic(decrypted || "");
      setShowPasswordPrompt(false);
      // handleSend will be called in useEffect after mnemonic is set
    } catch (err: any) {
      setPasswordError(err.message || "Failed to unlock wallet.");
    }
  }

  React.useEffect(() => {
    // Only trigger send if mnemonic is set and password prompt is closed
    if (mnemonic && !showPasswordPrompt && masterPassword) {
      setWaiting(true);
      handleSend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mnemonic, showPasswordPrompt]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-screen h-screen bg-black/90">
      <div className="w-full h-full max-w-none max-h-none bg-gold-cardside p-12 mt-[-10px] m-0 rounded-none overflow-y-auto flex flex-col justify-center">
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
                }[chain] || "/cryptos/walletconnect-icon.svg"
              }
              alt={chain}
              title={chain}
              className="w-8 h-8 mr-2 inline-block align-middle"
            />
            <span className="align-middle text-lg font-semibold">Send {chain}</span>
          </div>
          <X size={22} onClick={onClose} className="text-gray-600 cursor-pointer" />
        </div>
        {waiting && !successTransfer && <div className="text-gray-600 mb-3">Waiting for confirmation...</div>}
        {error && <div className="text-red-500 mb-3">{error}</div>}
        {txid && (
          <div className="text-green-600 mb-3">
            Success!<br />
          </div>
        )}
        {!successTransfer ? (
          <>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Recipient Address</label>
              <p className="text-[12px] text-gray-600 mt-2 mb-2">Check recipient address carefully before sending. Crypto transactions are irreversible.</p>
              <div className="flex gap-2">
                <input
                  className="border p-2 w-full rounded"
                  placeholder="Recipient Address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  id="recipient-input"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  title="Scan QR"
                  onClick={() => setShowQrScanner(true)}
                >
                  <QrCodeIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block mb-1 font-medium">Amount</label>
              <div className="flex gap-2 items-center">
                <input
                  className="border p-2 w-full rounded"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  min="0"
                />
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {["ETH", "BNB", "AVAX", "BASE", "POL"].includes(chain)
                    ? chain
                    : chain === "SOL"
                      ? "SOL"
                      : chain === "TRX"
                        ? "TRX"
                        : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  type="button"
                  className="px-2 py-1 rounded text-xs"
                  onClick={() => setAmount((balance || 0).toString())}
                >
                  Max
                </Button>
                <Button
                  type="button"
                  className="px-2 py-1 rounded text-xs"
                  onClick={() => setAmount(((balance || 0) * 0.1).toFixed(6).replace(/\.?0+$/, ""))}
                >
                  10%
                </Button>
                <Button
                  type="button"
                  className="px-2 py-1 rounded text-xs"
                  onClick={() => setAmount(((balance || 0) * 0.25).toFixed(6).replace(/\.?0+$/, ""))}
                >
                  25%
                </Button>
                <Button
                  type="button"
                  className="px-2 py-1 rounded text-xs"
                  onClick={() => setAmount(((balance || 0) * 0.5).toFixed(6).replace(/\.?0+$/, ""))}
                >
                  50%
                </Button>
                <Button
                  type="button"
                  className="px-2 py-1 rounded text-xs"
                  onClick={() => setAmount(((balance || 0) * 0.75).toFixed(6).replace(/\.?0+$/, ""))}
                >
                  75%
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Balance: {balance}{" "}
                {["ETH", "BNB", "AVAX", "BASE", "POL"].includes(chain)
                  ? chain
                  : chain === "SOL"
                    ? "SOL"
                    : chain === "TRX"
                      ? "TRX"
                      : ""}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gold-cardback rounded-xl shadow p-5 mb-3 flex flex-col gap-3 border border-green-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Sender:</span>
              <span className="font-mono text-gray-600 dark:text-gray-100">
                {fromAddress.slice(0, 6)}...{fromAddress.slice(-6)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Receiver:</span>
              <span className="font-mono text-gray-600 dark:text-gray-100">
                {recipient.slice(0, 6)}...{recipient.slice(-6)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Amount:</span>
              <span className="font-mono text-green-700">
                {amount}{" "}
                {["ETH", "BNB", "AVAX", "BASE"].includes(chain)
                  ? chain
                  : chain === "SOL"
                    ? "SOL"
                    : chain === "TRX"
                      ? "TRX"
                      : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Chain:</span>
              <span className="font-mono text-blue-700">{chain}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">TXID:</span>
              <pre className="break-all whitespace-pre-wrap text-xs bg-gray-100 rounded p-2 mt-1 text-gray-800">
                {txid?.match(/.{1,32}/g)?.join("\n")}
              </pre>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-stretch gap-2">
              <Button
                className="w-auto ml-2 mr-2"
                asChild
              >
                <a
                  href={
                    chain === "BTC"
                      ? `https://www.blockchain.com/btc/address/${fromAddress}`
                      : chain === "ETH"
                        ? `https://etherscan.io/address/${fromAddress}`
                        : chain === "BNB"
                          ? `https://bscscan.com/address/${fromAddress}`
                          : chain === "TRX"
                            ? `https://tronscan.org/#/address/${fromAddress}`
                            : chain === "SOL"
                              ? `https://solscan.io/account/${fromAddress}`
                              : chain === "AVAX"
                                ? `https://cchain.explorer.avax.network/address/${fromAddress}/transactions`
                                : chain === "BASE"
                                  ? `https://basescan.org/address/${fromAddress}`
                                  : chain === "POL"
                                    ? `https://polygonscan.com/address/${fromAddress}`
                                    : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <History className="ml-2 mr-2 h-4 w-4" /> Activity
                </a>
              </Button>
            </div>
          </div>
        )}
        {/* QR Scanner Modal */}
        {showQrScanner && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
          <WalletQRScanner
            onAddressDetected={setRecipient}
            onClose={() => setShowQrScanner(false)}
            onSuccess={() => setShowQrScanner(false)}
          />
          </div>
        )}
        <div className="h-8" />
        <div className="flex justify-between">
          <Button
            className="px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </Button>
            <Button
              disabled={
              loading ||
              !fromAddress ||
              !recipient ||
              !amount
              }
              className="px-4 py-2 rounded"
              style={{ zIndex: showQrScanner ? 10 : undefined, position: showQrScanner ? "relative" : undefined }}
              onClick={() => setShowPasswordPrompt(true)}
            >
              <Send className="ml-2 mr-2 h-4 w-4" /> {loading ? "Sending..." : "Send"}
            </Button>
        </div>
      </div>

      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center">
          <form
            className="bg-gold-card p-6 rounded-xl w-[350px] shadow-xl flex flex-col gap-3"
            onSubmit={handlePasswordSubmit}
          >
            <h3 className="text-lg font-bold mb-2">Enter Password</h3>
            <input
              type="password"
              className="border p-2 w-full rounded"
              placeholder="Password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              autoFocus
            />
            {passwordError && (
              <div className="text-red-500">{passwordError}</div>
            )}
            <div className="flex justify-end gap-2 mt-2">
              <Button
                className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setMasterPassword("");
                  setPasswordError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded"
                disabled={!masterPassword}
              >
                Unlock & Send
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
