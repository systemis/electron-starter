import React from 'react';
import { useParams } from 'react-router-dom';
import { AgentDetail } from '../components/AgentDetail';
import { useAgents } from '../hooks/useAgents';

export function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const { agents } = useAgents();

  // Find agent by ID or sanitized name if using slugs
  const agent = agents.find(a => a.id === agentId); // Assuming id is used in URL

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Agent not found
      </div>
    );
  }

  return <AgentDetail agent={agent} />;
}
