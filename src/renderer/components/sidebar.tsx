import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  ListTodo,
  Settings,
} from 'lucide-react';
import { CSSProperties } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: ListTodo, label: 'Tasks', path: '/tasks' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
];

export function Sidebar() {
  const location = useLocation();

  console.debug('rendering sidebar');

  return (
    <aside className="w-[260px] h-screen flex flex-col border-r border-white/5 bg-transparent">
      {/* Draggable Header Area / Traffic Light Spacer */}
      {/* Reduced height to just cover traffic lights (approx 32px) */}
      <div
        className="h-8 w-full shrink-0 drag-region"
        style={{ WebkitAppRegion: 'drag' } as CSSProperties}
      />

      {/* Brand - Pushed up slightly */}
      <div className="px-6 pb-4 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white shadow-lg shadow-white/10 flex items-center justify-center">
          <div className="w-3 h-3 bg-zinc-900 rounded-full" />
        </div>
        <span className="font-semibold text-lg tracking-tight text-white">
          Orbit
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10 text-[14px] font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5',
                )}
              >
                <item.icon
                  size={18}
                  className={cn('opacity-70', isActive && 'opacity-100')}
                />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Settings - Fixed at bottom */}
      <div className="p-4 border-t border-white/5 shrink-0 mb-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-400 hover:text-white"
        >
          <Settings size={18} className="opacity-70" />
          Settings
        </Button>
      </div>
    </aside>
  );
}
