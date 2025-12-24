import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Folder, Clock, ArrowRight } from 'lucide-react';
import { Project } from '../../shared/types';
import { Button } from '../components/ui/button';

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch recent sessions for Claude Code by default for now
        const result = await window.electron.ipcRenderer.invoke('sessions:get-recent', 'Claude Code');
        setProjects(result);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return <div className="p-10 text-muted-foreground">Loading projects...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Manage your AI agent sessions and projects.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Projects</span>
          <div className="mt-2 text-3xl font-semibold text-foreground">{projects.length}</div>
        </div>
        {/* Add more stats later */}
      </div>

      {/* Projects List */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
        <div className="grid grid-cols-1 gap-4">
          {projects.length === 0 ? (
            <div className="text-muted-foreground text-sm p-4 border border-dashed border-border rounded-xl">
              No recent projects found.
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Folder size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">{project.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{project.path}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock size={14} />
                    <span>{formatDistanceToNow(new Date(project.lastActivityDate), { addSuffix: true })}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
