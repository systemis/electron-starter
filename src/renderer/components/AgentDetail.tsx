import React from 'react';
import { Terminal, Folder, Settings, Bell } from 'lucide-react';
import { Agent } from '../../shared/types';
import { useSessions } from '../hooks/useSessions';
import { SessionCard } from './SessionCard';
import { ProjectCard } from './ProjectCard';
import { cn } from '../lib/utils';
import claudeIcon from '../assets/icons/claude.png';

// Local cn utility if not available
// function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface AgentDetailProps {
  agent: Agent;
}

export function AgentDetail({ agent }: AgentDetailProps) {
  const { activeSessions, recentProjects, loading } = useSessions(agent.name);
  const isClaude = agent.name === 'Claude Code';

  // Agent Brand Colors (matching Swift)
  const getBrandColor = (name: string) => {
    switch (name) {
      case 'Claude Code': return 'text-[#D97757]'; // Copper
      case 'Cursor': return 'text-blue-500';
      case 'Antigravity': return 'text-green-600';
      case 'GitHub Copilot': return 'text-sky-500';
      default: return 'text-gray-500';
    }
  };

  const brandColor = getBrandColor(agent.name);
  const brandBorder = `${brandColor.replace('text-', 'border-')}/20`;

  if (loading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground p-10">Loading agent data...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Header */}
      <header className="p-6 border-b flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center shadow-sm overflow-hidden bg-background", brandBorder)}>
            {isClaude ? (
              <img src={claudeIcon} alt="Claude" className="w-full h-full object-cover" />
            ) : (
              <span className={cn("text-2xl font-bold", brandColor)}>{agent.name[0]}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                agent.isRunning ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20")}>
                <div className={cn("w-1.5 h-1.5 rounded-full", agent.isRunning ? "bg-green-500" : "bg-gray-500")} />
                {agent.isRunning ? "Running" : "Stopped"}
              </div>
              <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                agent.isInstalled ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20")}>
                {agent.isInstalled ? "Installed" : "Not Installed"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <Bell size={20} />
          </button>
          <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors font-medium text-sm">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-6">
          {/* Active Sessions Column (Only for Claude currently) */}
          {isClaude && (
            <div className="flex-1 flex flex-col gap-4 min-w-[300px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Terminal size={18} className={brandColor} />
                  Active Sessions
                </div>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-accent text-muted-foreground")}>
                  {activeSessions.length}
                </span>
              </div>

              <div className="space-y-3">
                {activeSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-xl border-dashed bg-card/30">
                    <Terminal size={32} className="opacity-20 mb-2" />
                    <p className="text-sm">No active sessions</p>
                    <p className="text-xs opacity-60">Start a session in terminal</p>
                  </div>
                ) : (
                  activeSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Project History Column */}
          <div className="flex-1 flex flex-col gap-4 min-w-[300px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Folder size={18} className={brandColor} />
                Project History
              </div>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-accent text-muted-foreground")}>
                {recentProjects.length}
              </span>
            </div>

            <div className="space-y-3">
              {recentProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-xl border-dashed bg-card/30">
                  <Folder size={32} className="opacity-20 mb-2" />
                  <p className="text-sm">No project history</p>
                </div>
              ) : (
                recentProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
