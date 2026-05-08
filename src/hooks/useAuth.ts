import { useState, useEffect, useCallback, useRef } from "react";
import { AuthState, User } from "../types";
import { authApi } from "../services/api";

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ user: null });
  const [loading, setLoading] = useState(true);

  // Access token lives in memory only — never persisted
  const accessTokenRef = useRef<string | null>(null);

  // On mount: read the refresh token from storage and attempt a silent refresh.
  // This is what restores the session after the extension is reopened.
  useEffect(() => {
    async function restoreSession() {
      const { refreshToken } = await chrome.storage.local.get("refreshToken");

      if (!refreshToken || typeof refreshToken !== "string") {
        setLoading(false);
        return;
      }

      try {
        const { accessToken } = await authApi.refresh(refreshToken);
        accessTokenRef.current = accessToken;

        const user = await authApi.me();
        setAuth({ user: user as User });
      } catch {
        // Refresh token expired or invalid — clear it and show login
        await chrome.storage.local.remove("refreshToken");
        setAuth({ user: null });
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await authApi.login(email, password);

    // Access token → memory only
    accessTokenRef.current = accessToken;

    // Refresh token → persisted in chrome.storage
    const { refreshToken } = user as any;
    await chrome.storage.local.set({ refreshToken });

    setAuth({ user: user as User });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { accessToken, user } = await authApi.register(
        name,
        email,
        password,
      );

      accessTokenRef.current = accessToken;

      const { refreshToken } = user as any;
      await chrome.storage.local.set({ refreshToken });

      setAuth({ user: user as User });
    },
    [],
  );

  const logout = useCallback(async () => {
    const { refreshToken } = await chrome.storage.local.get("refreshToken");

    if (!refreshToken || typeof refreshToken !== "string") {
      setLoading(false);
      return;
    }

    // Tell the backend to invalidate the token family
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        /* best effort */
      }
    }

    accessTokenRef.current = null;
    await chrome.storage.local.remove("refreshToken");
    setAuth({ user: null });
  }, []);

  // Expose getAccessToken so your API request layer can attach the Bearer token
  const getAccessToken = useCallback(() => accessTokenRef.current, []);

  return { auth, loading, login, register, logout, getAccessToken };
}
