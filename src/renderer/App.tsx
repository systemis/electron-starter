import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Layout from './layout';
import { Dashboard } from './pages/Dashboard';
import { AgentDetailPage } from './pages/AgentDetailPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agent/:agentId" element={<AgentDetailPage />} />
          <Route path="/projects" element={<div className="text-foreground">Projects Page</div>} />
          <Route path="/tasks" element={<div className="text-foreground">Tasks Page</div>} />
          <Route path="/messages" element={<div className="text-foreground">Messages Page</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
