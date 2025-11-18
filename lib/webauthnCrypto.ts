// webauthnCrypto.ts
//--------------------------------------------------------
// Reusable WebAuthn + AES-GCM Secure Storage Module
//--------------------------------------------------------

/**
 * BASE64URL HELPERS
 */
export const bufferToBase64Url = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

export const base64UrlToBuffer = (base64: string): ArrayBuffer => {
  base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

/**
 * CONSTANTS
 */
export const CRED_ID_KEY = "webauthn_credential_id";
export const USER_HANDLE_KEY = "webauthn_user_handle";
export const MASTER_PASSWORD_STORAGE_KEY = "webauthn_encrypted_master_password";
export const MASTER_PASSWORD_IV_KEY = "webauthn_master_password_iv";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * CRYPTO HELPERS
 */

// Use rawId hash → AES key
export const deriveAesKeyFromCredential = async (rawId: ArrayBuffer): Promise<CryptoKey> => {
  const hash = await crypto.subtle.digest("SHA-256", rawId);
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
};

// Encrypt password using derived AES key
export const encryptAndStoreMasterPassword = async (
  rawId: ArrayBuffer,
  password: string
): Promise<void> => {
  const key = await deriveAesKeyFromCredential(rawId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const passwordBytes = encoder.encode(password);

  const cipher = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  key,
  passwordBytes as unknown as ArrayBuffer
 );


  localStorage.setItem(MASTER_PASSWORD_STORAGE_KEY, bufferToBase64Url(cipher));
  localStorage.setItem(MASTER_PASSWORD_IV_KEY, bufferToBase64Url(iv));
};

// Decrypt master password
export const decryptStoredMasterPassword = async (
  rawId: ArrayBuffer
): Promise<string | null> => {
  const cipherBase64 = localStorage.getItem(MASTER_PASSWORD_STORAGE_KEY);
  const ivBase64 = localStorage.getItem(MASTER_PASSWORD_IV_KEY);
  if (!cipherBase64 || !ivBase64) return null;

  try {
    const key = await deriveAesKeyFromCredential(rawId);
    const iv = new Uint8Array(base64UrlToBuffer(ivBase64));
    const cipher = base64UrlToBuffer(cipherBase64);

    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      cipher
    );

    return decoder.decode(plain);
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
};

/**
 * WEB AUTHN REGISTER
 */
export const registerCredential = async (
  masterPassword: string,
  rpName = "NopeWallet",
  userName = "wallet@nopewallet.com",
  displayName = "Wallet User"
): Promise<PublicKeyCredential | null> => {
  if (!masterPassword) throw new Error("Master password required.");

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  localStorage.setItem(USER_HANDLE_KEY, bufferToBase64Url(userId));

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: rpName,
      id: window.location.hostname,
    },
    user: {
      id: userId,
      name: userName,
      displayName,
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required",
    },
    attestation: "none",
    timeout: 60000,
  };

  const credential = (await navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential;

  if (!credential) return null;

  const rawId = credential.rawId;
  localStorage.setItem(CRED_ID_KEY, bufferToBase64Url(rawId));

  // Encrypt master password
  await encryptAndStoreMasterPassword(rawId, masterPassword);

  return credential;
};

/**
 * WEB AUTHN AUTHENTICATE
 */
export const authenticateWithBiometrics = async (): Promise<string | null> => {
  const credIdBase64 = localStorage.getItem(CRED_ID_KEY);
  if (!credIdBase64) return "Biometric credential not set up.";

  const allowCred = {
    type: "public-key" as const,
    id: base64UrlToBuffer(credIdBase64),
    transports: ["internal" as AuthenticatorTransport],
  };

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    allowCredentials: [allowCred],
    userVerification: "required",
    timeout: 60000,
  };

  const assertion = (await navigator.credentials.get({
    publicKey,
  })) as PublicKeyCredential;

  if (!assertion) return null;

  const rawId = assertion.rawId;

  // Attempt to decrypt master password
  return await decryptStoredMasterPassword(rawId);
};

/**
 * UTILITY
 */
export const isWebAuthnSupported = (): boolean => {
  return !!(window.PublicKeyCredential && navigator.credentials);
};
