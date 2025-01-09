import * as CryptoJS from 'crypto-js';

// Replace with secure, unique keys in production
const ENCRYPTION_KEY = '000102030405060238090a0b0c0d0e0f'; // Must be 32 characters for AES-256
const IV = CryptoJS.enc.Hex.parse('000102030405060708090a0b0c0d0e0f'); // 16 bytes (32 hex chars)

// Function to encrypt a token
export function encryptToken(token: string) {
  const encrypted = CryptoJS.AES.encrypt(
    token,
    CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY),
    {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );
  return encrypted.toString(); // Encrypted string
}

// Function to decrypt a token
export function decryptToken(encryptedToken: string): string {
  const decrypted = CryptoJS.AES.decrypt(
    encryptedToken,
    CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY),
    {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );
  return decrypted.toString(CryptoJS.enc.Utf8); // Decrypted token as string
}
