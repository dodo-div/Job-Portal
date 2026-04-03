import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import EmployerDashboard from './pages/EmployerDashboard';
import SeekerDashboard from './pages/SeekerDashboard';
import FindCandidates from './pages/FindCandidates';
import AdminDashboard from './pages/AdminDashboard';
import Applicants from './pages/Applicants';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/jobs" />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/seeker/dashboard" element={
            <PrivateRoute roles={['seeker']}><SeekerDashboard /></PrivateRoute>
          } />
          <Route path="/employer/dashboard" element={
            <PrivateRoute roles={['employer']}><EmployerDashboard /></PrivateRoute>
          } />
          <Route path="/employer/applicants/:jobId" element={
            <PrivateRoute roles={['employer', 'admin']}><Applicants /></PrivateRoute>
          } />
          <Route path="/employer/find-candidates" element={
            <PrivateRoute roles={['employer', 'admin']}><FindCandidates /></PrivateRoute>
          } />
          <Route path="/admin/dashboard" element={
            <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
