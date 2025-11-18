"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as bip39 from "bip39";
import { SecureWallet } from "./secureWallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function CreateWalletPage({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accountError, setAccountError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [step, setStep] = useState(1);
  const [existingAccounts, setExistingAccounts] = useState<string[]>([]);

  useEffect(() => {
    SecureWallet.listAccounts().then(setExistingAccounts);
  }, []);

  async function generateMnemonic() {
    const phrase = bip39.generateMnemonic();
    setMnemonic(phrase);
    setStep(2);
  }

  async function saveWallet() {
    if (!mnemonic || password !== confirmPassword) {
      alert("Passwords do not match or missing mnemonic");
      return;
    }
    if (!accountId.trim()) {
      setAccountError("Account name is required");
      return;
    }
    const normalized = accountId.trim().toLowerCase();
    if (existingAccounts.includes(normalized)) {
      setAccountError("Account name already exists");
      return;
    }
    setAccountError(null);
    setLoading(true);

    try {
      await SecureWallet.saveMnemonic(
        mnemonic,
        password,
        biometricEnabled,
        accountId
      );
      setStep(3);
      if (onCreated) onCreated();
    } catch (e) {
      console.error("Error saving wallet:", e);
      alert("Failed to save wallet securely.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-[380px]"
      >
        <Card className="p-3 bg-gray-950/80 border border-gray-800 text-white shadow-2xl rounded-2xl backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="flex justify-center items-center gap-2 text-xl">
              <Shield size={20} /> Create New Wallet
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* STEP 1 — Generate */}
            {step === 1 && (
              <div className="text-center space-y-4">
                <p className="text-gray-300 text-sm">
                  A new secure wallet will be created locally. You’ll receive a
                  recovery phrase — keep it safe and private.
                </p>
                <Button
                  onClick={generateMnemonic}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Generate Wallet
                </Button>
              </div>
            )}

            {/* STEP 2 — Show mnemonic */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <p className="text-gray-300 text-sm text-center">
                  Write down your <strong>12-word recovery phrase</strong> and
                  store it safely. Never share it.
                </p>

                <div className="p-3 border border-gray-700 rounded-lg bg-gray-900 text-center text-sm leading-relaxed select-text relative">
                  {showMnemonic ? (
                    mnemonic
                  ) : (
                    <span className="blur-sm select-none">
                      {mnemonic.replace(/\S/g, "•••")}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    onClick={() => setShowMnemonic(!showMnemonic)}
                  >
                    {showMnemonic ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>

                <div className="mt-4">
                  <Input
                    type="text"
                    placeholder="Account name (unique)"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  {accountError && (
                    <div className="text-red-400 text-xs mt-1">{accountError}</div>
                  )}
                  <Input
                    type="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 bg-gray-900 border-gray-700 text-white"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    checked={biometricEnabled}
                    onChange={(e) => setBiometricEnabled(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm text-gray-300">
                    Enable Face ID / fingerprint unlock
                  </span>
                </div>

                <Button
                  onClick={saveWallet}
                  disabled={loading || !password}
                  className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    "Save Wallet Securely"
                  )}
                </Button>
              </motion.div>
            )}

            {/* STEP 3 — Success */}
            {step === 3 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <CheckCircle size={48} className="text-green-400 mx-auto" />
                <h3 className="text-lg font-semibold">Wallet Created!</h3>
                <p className="text-gray-400 text-sm">
                  Your wallet is encrypted and ready to use. Keep your recovery
                  phrase somewhere offline.
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.reload()}
                >
                  Continue
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
