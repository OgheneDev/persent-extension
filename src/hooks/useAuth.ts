import { useState, useEffect, useCallback } from "react";
import { AuthState, User } from "../types";
import { authApi } from "../services/api";

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_AUTH" }, (result) => {
      setAuth({ token: result.token, user: result.user });
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    await chrome.runtime.sendMessage({ type: "SET_AUTH", payload: { token, user } });
    setAuth({ token, user: user as User });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user } = await authApi.register(name, email, password);
    await chrome.runtime.sendMessage({ type: "SET_AUTH", payload: { token, user } });
    setAuth({ token, user: user as User });
  }, []);

  const logout = useCallback(async () => {
    await chrome.runtime.sendMessage({ type: "CLEAR_AUTH" });
    setAuth({ token: null, user: null });
  }, []);

  return { auth, loading, login, register, logout };
}
