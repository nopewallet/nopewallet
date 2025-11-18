// secureWallet.tsx
import CryptoJS from "crypto-js";
import {
  registerCredential,
  isWebAuthnSupported
} from "@/lib/webauthnCrypto";

const LEGACY_KEY = "encryptedMnemonic";
const INDEX_KEY = `${LEGACY_KEY}:index`;
const DEFAULT_ACCOUNT_ID = "account1";

let isNative = false;
try {
  isNative =
    typeof navigator !== "undefined" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.toLowerCase().includes("reactnative");
} catch (_) {}

let SecureStore: any = null;
let LocalAuth: any = null;

if (isNative) {
  try {
    SecureStore = require("expo-secure-store");
    LocalAuth = require("expo-local-authentication");
  } catch {
    console.warn("Secure modules not available, using fallback");
  }
}

const storage = {
  async getItem(key: string) {
    if (isNative && SecureStore?.getItemAsync) return SecureStore.getItemAsync(key);
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string, options?: Record<string, any>) {
    if (isNative && SecureStore?.setItemAsync) {
      await SecureStore.setItemAsync(key, value, options);
    } else {
      localStorage.setItem(key, value);
    }
  },
  async deleteItem(key: string) {
    if (isNative && SecureStore?.deleteItemAsync) {
      await SecureStore.deleteItemAsync(key);
    } else {
      localStorage.removeItem(key);
    }
  },
};

const normalizeAccountId = (accountId = DEFAULT_ACCOUNT_ID) =>
  (accountId?.trim() || DEFAULT_ACCOUNT_ID).toLowerCase();

interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string, options?: Record<string, any>): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

type AccountId = string;

const getStorageKey = (accountId?: AccountId): string => {
  const normalized = normalizeAccountId(accountId);
  return `${LEGACY_KEY}:${normalized}`;
};

const readAccountIndex = async (): Promise<string[]> => {
  const raw = await storage.getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAccountIndex = async (ids: string[]) => {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  await storage.setItem(INDEX_KEY, JSON.stringify(unique));
};

const ensureAccountIndexed = async (accountId: string) => {
  const normalized = normalizeAccountId(accountId);
  const current = await readAccountIndex();
  if (!current.includes(normalized)) {
    current.push(normalized);
    await writeAccountIndex(current);
  }
};

const removeAccountFromIndex = async (accountId: string) => {
  const normalized = normalizeAccountId(accountId);
  const updated = (await readAccountIndex()).filter((id) => id !== normalized);
  await writeAccountIndex(updated);
};

export const SecureWallet = {
  async saveMnemonic(
    mnemonic: string,
    password?: string,
    enableBiometrics = false,
    accountId?: string
  ) {
    // When accountId is not provided, use "Account" + a number but check there is no collision
    let newAccountId = accountId;
    const existingAccounts = await this.listAccounts();

    if (!newAccountId) {
      let index = 1;
      newAccountId = `account${index}`;
      while (existingAccounts.includes(newAccountId)) {
        index++;
        newAccountId = `account${index}`;
      }
    } else {
      // If accountId is provided and already exists, prevent overwrite
      if (existingAccounts.includes(newAccountId)) {
        throw new Error("Account name already exists. Please choose a different account name.");
      }
    }
    // check if the password does not decrypt any existing mnemonic tell the user the password should be the same as before
    if (existingAccounts.length > 0 && password) {
      let passwordMatches = false;
      for (const acc of existingAccounts) {
        const existingMnemonic = await this.loadMnemonic(acc, password);
        if (existingMnemonic) {
          passwordMatches = true;
          break;
        }
      }
      if (!passwordMatches) {
        throw new Error("Password does not match any existing account. Please use the same password as before.");
      }
    }
    
    // Check there is no other account with the same mnemonic
    for (const acc of existingAccounts) {
      const existingMnemonic = await this.loadMnemonic(acc, password);
      if (existingMnemonic === mnemonic) {
        throw new Error("An account with this mnemonic already exists.");
      }
    }
    try {
      const encrypted = CryptoJS.AES.encrypt(
        mnemonic,
        password || "biometric-key"
      ).toString();

      const key = getStorageKey(newAccountId);
      await storage.setItem(key, encrypted, {
        requireAuthentication: enableBiometrics,
        authenticationPrompt: "Unlock your wallet",
      });

      await ensureAccountIndexed(newAccountId ?? DEFAULT_ACCOUNT_ID);
    } catch (err) {
      console.error("Error saving mnemonic:", err);
    }
  },

  async enableBiometricLogin(password: string) {
    if (!isWebAuthnSupported()) return alert("Not supported");
        const credential = await registerCredential(password, "Nope Wallet");
        if (credential) {
          return true;
        }
  },

  async loadMnemonic(
    accountId = DEFAULT_ACCOUNT_ID,
    password?: string
  ): Promise<string | null> {
    try {
      const key = getStorageKey(accountId);
      const encrypted = await storage.getItem(key);
      if (!encrypted) return null;

      const decryptedBytes = CryptoJS.AES.decrypt(
        encrypted,
        password || "biometric-key"
      );
      let decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) return null;

      setTimeout(() => {
        decrypted = "";
      }, 30_000);

      return decrypted;
    } catch (err) {
      console.error("Error decrypting mnemonic:", err);
      return null;
    }
  },

  async biometricUnlock(): Promise<boolean> {
    if (!isNative || !LocalAuth) return false;

    const hasHardware = await LocalAuth.hasHardwareAsync();
    const supported = await LocalAuth.supportedAuthenticationTypesAsync();
    const isEnrolled = await LocalAuth.isEnrolledAsync?.();

    if (!hasHardware || supported.length === 0) {
      console.warn("No biometric hardware found");
      return false;
    }

    if (isEnrolled === false) {
      console.warn("No biometrics enrolled on device");
      return false;
    }

    const result = await LocalAuth.authenticateAsync({
      promptMessage: "Unlock your wallet",
      disableDeviceFallback: true,
    });

    return !!(result.success ?? result.authenticated);
  },

  async clearMnemonic(accountId = DEFAULT_ACCOUNT_ID) {
    const key = getStorageKey(accountId);
    await storage.deleteItem(key);
    await removeAccountFromIndex(accountId);
  },

  async hasMnemonic(accountId = DEFAULT_ACCOUNT_ID): Promise<boolean> {
    const key = getStorageKey(accountId);
    const exists = await storage.getItem(key);
    return !!exists;
  },

  async listAccounts(): Promise<string[]> {
    const ids = await readAccountIndex();
    if (!ids.length) {
      const legacy = await storage.getItem(LEGACY_KEY);
      return legacy ? [DEFAULT_ACCOUNT_ID] : [];
    }
    return Array.from(new Set(ids));
  },
};
