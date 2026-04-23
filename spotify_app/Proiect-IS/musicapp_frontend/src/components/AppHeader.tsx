import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div>
        <h1>MusicApp</h1>
        <small>Frontend + Spring Security JWT</small>
      </div>
      <div className="app-header__actions">
        {user && (
          <span className="app-header__user">
            Autentificat ca <strong>{user.username}</strong>
          </span>
        )}
        <Link to="/register" className="btn btn--ghost">
          Creează cont nou
        </Link>
        <button className="btn btn--danger" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default AppHeader;

