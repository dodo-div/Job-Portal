import { startTransition, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const dashboards = {
  seeker: '/seeker/dashboard',
  employer: '/employer/dashboard',
  admin: '/admin/dashboard',
};

const searchLinks = [['/employer/find-candidates', 'Find candidates'], ['/employer/find-contacts', 'Find contacts']];
const roleLinks = {
  seeker: [[dashboards.seeker, 'Applications']],
  employer: [[dashboards.employer, 'My jobs'], ...searchLinks],
  admin: [[dashboards.admin, 'Administration'], ...searchLinks],
};

function Brand() {
  return <Link className="brand" to="/" aria-label="JobPortal home"><span className="brand-mark" aria-hidden="true">J</span>JobPortal</Link>;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const main = useRef(null);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  function signOut() {
    startTransition(() => {
      logout();
      navigate('/', { replace: true });
    });
  }

  return (
    <>
      <a className="skip-link" href="#content">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav aria-label="Main navigation" className="main-nav">
            <NavLink to="/jobs">Browse jobs</NavLink>
            {(roleLinks[user?.role] || []).map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
          </nav>
          <div className="header-actions">
            {user ? <button className="button button-secondary" onClick={signOut}>Sign out</button> : <>
              <Link className="button button-quiet" to="/login">Sign in</Link>
              <Link className="button" to="/register">Create account</Link>
            </>}
          </div>
        </div>
      </header>
      <main id="content" tabIndex={-1} ref={main}><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand"><Brand /><p>Jobs and recruiting in one place.</p></div>
          <nav aria-label="Footer navigation" className="footer-nav">
            <Link to="/jobs">Browse jobs</Link>
            {user ? <Link to={dashboards[user.role]}>Dashboard</Link> : <>
              <Link to="/register?role=employer">For employers</Link>
              <Link to="/login">Sign in</Link>
            </>}
          </nav>
        </div>
      </footer>
    </>
  );
}
