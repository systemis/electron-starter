import React from 'react';
import { Folder, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Project } from '../../shared/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  isSelected?: boolean;
}

export function ProjectCard({ project, onClick, isSelected }: ProjectCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-primary/20",
        "hover:bg-accent/50",
        isSelected ? "bg-accent border-primary/20 shadow-sm" : "bg-card border-border/50 shadow-sm"
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 font-medium text-sm">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Folder size={14} />
          </div>
          <span className="truncate">{project.name}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 w-full">
        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[70%] opacity-70">
          {project.path}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock size={10} />
          <span>{formatDistanceToNow(new Date(project.lastActivityDate), { addSuffix: true })}</span>
        </div>
      </div>
    </button>
  );
}
