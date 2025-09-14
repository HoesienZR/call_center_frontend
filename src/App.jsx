import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import FileUpload from './components/FileUpload';
import CallRequest from './components/CallRequest';
import CallFeedback from './components/CallFeedback';
import Reports from './components/Reports';
import AdminDashboard from './components/AdminDashboard';
import './App.css';


function App() {
  return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            <Route path="/project/:projectId/upload" element={<FileUpload />} />
            <Route path="/project/:projectId/call-request" element={<CallRequest />} />
            <Route path="/project/:projectId/call-feedback/:contactId" element={<CallFeedback />} />
            <Route path="/project/:projectId/reports" element={<Reports />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/users/:projectId" element={<UserList />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;

import UserList from './components/ProjectCreatorUserList.jsx';

