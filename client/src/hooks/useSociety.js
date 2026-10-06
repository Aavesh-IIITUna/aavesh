import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { fallbackMembers, fallbackProjects, fallbackSociety, fallbackTracks } from '../data/content.js';

export function useSociety() {
  const [state, setState] = useState({
    society: fallbackSociety,
    tracks: fallbackTracks,
    projects: fallbackProjects,
    members: fallbackMembers,
    live: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      try {
        const [society, tracks, projects, members] = await Promise.all([
          api.getSociety({ signal }).catch(() => null),
          api.getTracks({ signal }).catch(() => null),
          api.listProjects({ signal }).catch(() => null),
          api.listMembers({ signal }).catch(() => null),
        ]);

        if (signal.aborted) return;

        setState((prev) => ({
          ...prev,
          society: society ?? prev.society,
          tracks: tracks?.length ? tracks : prev.tracks,
          projects: projects?.length ? projects : prev.projects,
          members: members?.length ? members : prev.members,
          live: Boolean(society || tracks || projects || members),
          loading: false,
          error: null,
        }));
      } catch (err) {
        if (signal.aborted) return;
        setState((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return state;
}