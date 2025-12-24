import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  let Icon = Monitor;
  if (theme === 'light') {
    Icon = Sun;
  } else if (theme === 'dark') {
    Icon = Moon;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9 shrink-0"
      title={`Current: ${theme} (click to cycle)`}
    >
      <Icon size={18} />
    </Button>
  );
}
