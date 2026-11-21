import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import EmployerDashboard from './pages/EmployerDashboard';
import SeekerDashboard from './pages/SeekerDashboard';
import FindCandidates from './pages/FindCandidates';
import FindContacts from './pages/FindContacts';
import AdminDashboard from './pages/AdminDashboard';
import Applicants from './pages/Applicants';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  if (!roles.includes(user.role)) return <Navigate to="/jobs" replace />;
  return children;
}

export default function App() {
  return <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/seeker/dashboard" element={<PrivateRoute roles={['seeker']}><SeekerDashboard /></PrivateRoute>} />
          <Route path="/seeker/find-contacts" element={<PrivateRoute roles={['seeker']}><FindContacts /></PrivateRoute>} />
          <Route path="/employer/dashboard" element={<PrivateRoute roles={['employer']}><EmployerDashboard /></PrivateRoute>} />
          <Route path="/employer/applicants/:jobId" element={<PrivateRoute roles={['employer', 'admin']}><Applicants /></PrivateRoute>} />
          <Route path="/employer/find-candidates" element={<PrivateRoute roles={['employer', 'admin']}><FindCandidates /></PrivateRoute>} />
          <Route path="/employer/find-contacts" element={<PrivateRoute roles={['employer', 'admin']}><FindContacts /></PrivateRoute>} />
          <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="*" element={<div className="container page"><h1>Page not found</h1><Link to="/jobs">Browse jobs</Link></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>;
}
