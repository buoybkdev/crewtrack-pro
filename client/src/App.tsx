import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CrewMembers from './pages/CrewMembers';
import Assignments from './pages/Assignments';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crew" element={<CrewMembers />} />
        <Route path="/assignments" element={<Assignments />} />
      </Routes>
    </Layout>
  );
}
