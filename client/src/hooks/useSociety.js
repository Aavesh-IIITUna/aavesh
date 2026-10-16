import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { fallbackMembers, fallbackProjects, fallbackSociety, fallbackTracks } from '../data/content.js';

const loadResource = async (request, fallback, isValid) => {
  try {
    const value = await request;
    if (!isValid(value)) throw new Error('Unexpected API response shape');
    return { value, live: true };
  } catch {
    return { value: fallback, live: false };
  }
};

export function useSociety() {
  const [state, setState] = useState({
    society: null,
    tracks: [],
    projects: [],
    members: [],
    live: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const refreshMembers = async () => {
      const result = await loadResource(api.listMembers({ signal }), fallbackMembers, Array.isArray);
      if (signal.aborted) return;
      setState((current) => ({ ...current, members: result.value, live: current.live || result.live }));
    };
    window.addEventListener('aavesh:members-updated', refreshMembers);

    async function load() {
      const [society, tracks, projects, members] = await Promise.all([
        loadResource(api.getSociety({ signal }), fallbackSociety, (value) => value !== null && typeof value === 'object' && !Array.isArray(value)),
        loadResource(api.getTracks({ signal }), fallbackTracks, Array.isArray),
        loadResource(api.listProjects({ signal }), fallbackProjects, Array.isArray),
        loadResource(api.listMembers({ signal }), fallbackMembers, Array.isArray),
      ]);

      if (signal.aborted) return;

      setState({
        society: society.value,
        tracks: tracks.value,
        projects: projects.value,
        members: members.value,
        live: society.live || tracks.live || projects.live || members.live,
        loading: false,
        error: null,
      });
    }

    load();
    return () => {
      window.removeEventListener('aavesh:members-updated', refreshMembers);
      controller.abort();
    };
  }, []);

  return state;
}
