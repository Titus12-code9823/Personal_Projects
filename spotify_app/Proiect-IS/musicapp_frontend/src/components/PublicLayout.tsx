import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="layout layout--auth">
      <div className="layout__panel">
        <Outlet />
      </div>
      <div className="layout__aside">
        <h1>MusicApp</h1>
        <p>Gestionează artiști, piese și playlisturi în siguranță.</p>
        <small>Autentificare securizată cu JWT din backend-ul Spring.</small>
      </div>
    </div>
  );
};

export default PublicLayout;

