import { useEffect, useState } from "react";
import { useEncryptedStorage, passwordEncrypted } from "./useEncryptedStorage";

export function useAuthUser() {
  const { load } = useEncryptedStorage("secureData");
  const [user, setUser] = useState(null);
  const [loadingForSession, setLoadingForSession] = useState(true);

  useEffect(() => {
    async function getUser() {
      const data = await load(passwordEncrypted);
      setUser(data);
      setLoadingForSession(false);
    }

    getUser();
  }, [load]);

  return { user, loadingForSession };
}
