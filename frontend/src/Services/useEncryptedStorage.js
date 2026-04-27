import { useState, useCallback } from "react";
import { encryptData, decryptData } from "./cryptoUtils";

export const passwordEncrypted = "YourSecretKey123!"; 
export function useEncryptedStorage(keyName) {
  const [loading, setLoading] = useState(false);

  const save = useCallback(async (data, password) => {
    setLoading(true);
    try {
      const encrypted = await encryptData(data, password);
      localStorage.setItem(keyName, JSON.stringify(encrypted));
    } finally {
      setLoading(false);
    }
  }, [keyName]);

  const load = useCallback(async (password) => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(keyName);
      if (!stored) return null;

      return await decryptData(JSON.parse(stored), password);
    } catch (e) {
      console.error("Decryption failed", e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [keyName]);

  const clear = useCallback(() => {
    localStorage.removeItem(keyName);
  }, [keyName]);

  return { save, load, clear, loading };
}