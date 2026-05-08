import { useState, useEffect, useCallback, useRef } from "react";
import { AuthState, User } from "../types";
import { authApi } from "../services/api";

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ user: null });
  const [loading, setLoading] = useState(true);

  const accessTokenRef = useRef<string | null>(null);

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

        const user = await authApi.me(accessToken); // ← pass token directly
        setAuth({ user: user as User });
      } catch {
        await chrome.storage.local.remove("refreshToken");
        setAuth({ user: null });
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken, user } = await authApi.login(
      email,
      password,
    );

    accessTokenRef.current = accessToken;
    await chrome.storage.local.set({ refreshToken });
    setAuth({ user: user as User });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { accessToken, refreshToken, user } = await authApi.register(
        name,
        email,
        password,
      );

      accessTokenRef.current = accessToken;
      await chrome.storage.local.set({ refreshToken });
      setAuth({ user: user as User });
    },
    [],
  );

  const logout = useCallback(async () => {
    const { refreshToken } = await chrome.storage.local.get("refreshToken");

    if (refreshToken && typeof refreshToken === "string") {
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

  const getAccessToken = useCallback(() => accessTokenRef.current, []);

  return { auth, loading, login, register, logout, getAccessToken };
}
