import { CheckCircle } from 'lucide-react';
import { Agent } from '../../shared/types';
import { cn } from '../lib/utils';
// Import icons
import claudeIcon from '../assets/icons/claude.png';
import antigravityIcon from '../assets/icons/antigravity.png';
import cursorIcon from '../assets/icons/cursor.svg';

interface AgentItemProps {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
}

// Agent color map mirroring Swift
const agentColors: Record<string, string> = {
  'Claude Code': 'rgb(209, 133, 97)', // Claude orange/copper
  'Cursor': 'rgb(0, 120, 255)', // Cursor blue
  'Antigravity': 'rgb(66, 160, 71)', // Google green
  'GitHub Copilot': 'rgb(33, 150, 243)', // GitHub blue
};

// Icon map
const agentIcons: Record<string, string> = {
  'Claude Code': claudeIcon,
  'Antigravity': antigravityIcon,
  'Cursor': cursorIcon,
};

export function AgentItem({ agent, isSelected, onClick }: AgentItemProps) {
  const color = agentColors[agent.name] || 'rgb(150,150,150)';
  const iconSrc = agentIcons[agent.name];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group w-full text-left',
        'relative'
      )}
      style={{
        // Background
        backgroundColor: isSelected ? `color-mix(in sRGB, ${color} 15%, transparent)` : 'rgba(0,0,0,0.03)',
        // Border
        border: isSelected ? `2px solid ${color}` : '2px solid transparent',
      }}
    >
      {/* Icon Container */}
      <div className="relative">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in sRGB, ${color} 20%, transparent)` }}
        >
          {iconSrc ? (
            <img
              src={iconSrc}
              alt={agent.name}
              className="w-7 h-7 object-contain"
              style={{ borderRadius: agent.name === 'Claude Code' || agent.name === 'GitHub Copilot' ? 6 : 0 }}
            />
          ) : (
            <span className="text-lg font-bold" style={{ color }}>{agent.name[0]}</span>
          )}
        </div>

        {/* Running indicator */}
        {agent.isRunning && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border-2 border-white dark:border-gray-900" />
          </span>
        )}
      </div>

      {/* Agent Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold truncate text-sm text-foreground">{agent.name}</span>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn("text-xs truncate font-medium", agent.isRunning ? "text-green-500" : "text-muted-foreground")}>
            {agent.isRunning ? '•Running' : '•Stopped'}
          </span>
          {!agent.isInstalled && (
            <>
              <span className="text-muted-foreground/40 text-xs">•</span>
              <span className="text-xs text-orange-500 truncate">Not Installed</span>
            </>
          )}
        </div>
      </div>

      {/* Selection Checkmark */}
      {isSelected && (
        <CheckCircle size={20} style={{ color }} className="shrink-0" />
      )}
    </button>
  );
}
