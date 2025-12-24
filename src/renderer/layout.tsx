import { Outlet } from 'react-router-dom';
import { CSSProperties } from 'react';
import { Sidebar } from './components/sidebar';
import { ThemeProvider } from './contexts/ThemeContext';

export default function Layout() {
  return (
    <ThemeProvider>
      <div className="flex h-screen w-full bg-transparent overflow-hidden relative selection:bg-primary/20">
      {/* Liquid Background Blobs - Optional, keeping distinct from native blur for now, or removing to see pure native */}

      <div className="z-10 relative flex w-full h-full">
        {/* Sidebar transparent to show window vibrancy */}
        <Sidebar />

        {/* Main Content Opaque - Zinc 950 - Removed Blur for Performance */}
        <main className="flex-1 h-full flex flex-col bg-background/95 shadow-2xl">
          {/* Top Drag Region for Main Window */}
          <div
            className="h-8 w-full shrink-0"
            style={{ WebkitAppRegion: 'drag' } as CSSProperties}
          />

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-10 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      </div>
    </ThemeProvider>
  );
}
