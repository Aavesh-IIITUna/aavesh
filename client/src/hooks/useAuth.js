import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    api.getMe({ signal: controller.signal })
      .then((response) => setUser(response?.user ?? null))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setUser(null);
        if (error.status !== 401) {
          setSessionError('Could not check your session. You can still try signing in.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.login(credentials);
    setSessionError('');
    setUser(response.user);
    try {
      const profile = await api.getMe();
      setUser(profile?.user ?? response.user);
      return profile?.user ?? response.user;
    } catch {
      return response.user;
    }
  }, []);

  const register = useCallback(async (details) => {
    const response = await api.register(details);
    setSessionError('');
    setUser(response.user);
    try {
      const profile = await api.getMe();
      setUser(profile?.user ?? response.user);
      return profile?.user ?? response.user;
    } catch {
      return response.user;
    }
  }, []);

  const updateProfile = useCallback(async (details) => {
    const response = await api.updateMyProfile(details);
    setSessionError('');
    setUser(response.user);
    return response.user;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await api.getMe();
      setSessionError('');
      setUser(response?.user ?? null);
      return response?.user ?? null;
    } catch (error) {
      if (error.status === 401) {
        setSessionError('Your session has expired. Sign in again to continue.');
        setUser(null);
        return null;
      }
      setSessionError('Could not check your session. You can still try signing in.');
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setSessionError('');
    setUser(null);
  }, []);

  return { user, loading, sessionError, login, register, updateProfile, refresh, logout };
}
