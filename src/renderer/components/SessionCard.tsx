import React from 'react';
import { Clock, Folder, GitBranch, Cpu, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ClaudeSession, SessionStatus } from '../../shared/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SessionCardProps {
  session: ClaudeSession;
  onClick?: () => void;
  isSelected?: boolean;
}

const statusColors: Record<SessionStatus, string> = {
  waiting: 'text-orange-600 bg-orange-100 dark:bg-orange-500/20 dark:text-orange-400',
  processing: 'text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-400',
  thinking: 'text-blue-600 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400',
  idle: 'text-gray-600 bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400',
};

const statusLabels: Record<SessionStatus, string> = {
  waiting: 'Waiting',
  processing: 'Running',
  thinking: 'Thinking',
  idle: 'Idle',
};

export function SessionCard({ session, onClick, isSelected }: SessionCardProps) {
  // Format stats
  const pidDisplay = `PID: ${session.pid.toLocaleString()}`;
  const cpuDisplay = `${session.cpuUsage.toFixed(1)}%`;

  return (
    <button
      type="button"
      className={cn(
        "flex flex-col p-4 rounded-2xl border transition-all cursor-pointer w-full text-left focus:outline-none group relative bg-card hover:shadow-md",
        isSelected ? "ring-2 ring-primary/20 border-primary/30" : "border-border/60 shadow-sm"
      )}
      onClick={onClick}
    >
      {/* Header: Icon - Name - Status */}
      <div className="flex items-start justify-between w-full mb-3 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-[#D97757]/10 flex items-center justify-center shrink-0">
            <Folder size={20} className="text-[#D97757]" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-base truncate">{session.projectName}</span>
            <span className="text-xs text-muted-foreground truncate opacity-70" title={session.projectPath}>{session.projectPath}</span>
          </div>
        </div>

        <div className={cn("px-2.5 py-1 rounded-full text-xs font-bold leading-none shrink-0 whitespace-nowrap", statusColors[session.status])}>
          {statusLabels[session.status]}
        </div>
      </div>

      {/* Git Info */}
      {session.gitBranch && (
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <GitBranch size={14} className="opacity-70" />
          <span className="font-mono">{session.gitBranch}</span>
        </div>
      )}

      {/* Separator */}
      <div className="w-full h-px bg-border/40 mb-3" />

      {/* Content */}
      <div className="text-sm text-foreground/80 line-clamp-2 mb-4 min-h-[2.5em]">
        {session.lastMessage || 'No recent activity'}
      </div>

      {/* Footer: Stats */}
      <div className="flex items-center justify-between w-full text-[11px] text-muted-foreground font-mono opacity-80 mt-auto">
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>{formatDistanceToNow(new Date(session.lastActivityAt), { addSuffix: true })}</span>
        </div>

        {session.pid > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Activity size={12} />
              <span>{cpuDisplay}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu size={12} />
              <span>{pidDisplay}</span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
