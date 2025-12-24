import { Settings, LayoutDashboard } from 'lucide-react';
import { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useAgents } from '../hooks/useAgents';
import { AgentItem } from './AgentItem';
import { cn } from '../lib/utils';
import appIcon from '../assets/icons/app_icon.png';

export function Sidebar() {
  const { agents } = useAgents();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAgentClick = (agentId: string) => {
    navigate(`/agent/${agentId}`);
  };

  return (
    <aside className="w-[280px] h-screen flex flex-col border-r border-border bg-card/50 backdrop-blur-xl">
      {/* Draggable Header Area */}
      <div
        className="h-8 w-full shrink-0 drag-region"
        style={{ WebkitAppRegion: 'drag' } as CSSProperties}
      />

      {/* Header Stats */}
      <div className="px-6 pb-6 pt-5 flex flex-col gap-4 shrink-0">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-transparent flex items-center justify-center shadow-sm overflow-hidden">
            <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-lg leading-tight tracking-tight text-center">AI Manager</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1">
            <span className="text-xl font-bold text-green-600 dark:text-green-400">{agents.filter(a => a.isRunning).length}</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-green-600/70 dark:text-green-400/70">Running</span>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{agents.length}</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-600/70 dark:text-blue-400/70">Installed</span>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="flex-1 px-4 space-y-3 overflow-y-auto overflow-x-hidden min-h-0 py-2">
        <div className="text-xs font-semibold text-foreground/60 uppercase tracking-wider px-2 mb-2">My Agents</div>
        <div className="space-y-3">
          {agents.map((agent) => (
            <AgentItem
              key={agent.id}
              agent={agent}
              isSelected={location.pathname === `/agent/${agent.id}`}
              onClick={() => handleAgentClick(agent.id)}
            />
          ))}
          {agents.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">No agents found</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border shrink-0 bg-background/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-3 text-foreground/70 hover:text-foreground h-9"
          >
            <Settings size={16} className="opacity-70" />
            <span className="text-sm">Settings</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
