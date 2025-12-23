import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Layout from './layout';

// Placeholder Pages
function Dashboard() {
  return (
    <div className="space-y-6">
       <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Good Morning, Creator</h1>
            <p className="text-zinc-400">Tuesday, December 23</p>
       </div>

       <div className="grid grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-xl">
                <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Productivity</span>
                <div className="mt-2 text-3xl font-semibold text-white">94%</div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-xl">
                 <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Tasks</span>
                 <div className="mt-2 text-3xl font-semibold text-white">12</div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-xl">
                 <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Focus Time</span>
                 <div className="mt-2 text-3xl font-semibold text-white">4h 20m</div>
            </div>
       </div>

       <div className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/10">Design Phase</span>
                    <span className="text-zinc-500 text-sm font-medium">Current Focus</span>
                </div>
                <h2 className="text-3xl font-medium text-white mb-4">Prototype User Interface</h2>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-8">
                    <div className="h-full w-[65%] bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
            </div>
       </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<div className="text-white">Projects Page</div>} />
          <Route path="/tasks" element={<div className="text-white">Tasks Page</div>} />
          <Route path="/messages" element={<div className="text-white">Messages Page</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
