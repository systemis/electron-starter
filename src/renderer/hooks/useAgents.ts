import { useState, useEffect } from 'react';
import { Agent } from '../../shared/types';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('agents:get-all');
      setAgents(result);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return { agents, loading, refetch: fetchAgents };
}
