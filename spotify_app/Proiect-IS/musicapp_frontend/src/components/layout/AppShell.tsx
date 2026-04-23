import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Home', path: '/app' },
  { label: 'Search', path: '/app/search' },
  { label: 'Your Library', path: '/app/library' },
  { label: 'Create', path: '/app/create' }
];

const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="brand">
          <span className="brand__logo">♪</span>
          <strong>MusicApp</strong>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                isActive ? 'nav__item nav__item--active' : 'nav__item'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <p className="sidebar__user">
            Conectat ca <strong>{user?.username}</strong>
          </p>
          <button className="btn btn--ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="shell__content">
        <header className="shell__topbar">
          <div>
            <h1>Explorează biblioteca</h1>
            <p>Conținutul provine direct din backend-ul tău Spring.</p>
          </div>
        </header>
        <section className="shell__page">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AppShell;

