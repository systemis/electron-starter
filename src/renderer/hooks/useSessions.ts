import { useState, useEffect } from 'react';
import { Project, ClaudeSession } from '../../shared/types';

export function useSessions(agentName: string) {
  const [activeSessions, setActiveSessions] = useState<ClaudeSession[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const [sessions, projects] = await Promise.all([
          window.electron.ipcRenderer.invoke('sessions:get-active'),
          window.electron.ipcRenderer.invoke('sessions:get-recent', agentName)
        ]);

        if (mounted) {
          // Filter active sessions to only show for the current agent if needed
          // Currently 'sessions:get-active' returns all Claude sessions.
          // If agentName is not Claude Code, we might want to filter or return empty?
          // For now, assuming this hook is used contextually.

          if (agentName === 'Claude Code') {
            setActiveSessions(sessions as ClaudeSession[]);
          } else {
            setActiveSessions([]);
          }

          setRecentProjects(projects as Project[]);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [agentName]);

  return { activeSessions, recentProjects, loading };
}
