import { FormEvent, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ username, password });
      const fromLocation = location.state as {
        from?: { pathname?: string };
      };
      const redirectTo = fromLocation?.from?.pathname ?? '/app';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Autentificare eșuată');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Bine ai revenit!"
      subtitle="Autentifică-te cu datele din backend."
    >
      <form className="form" onSubmit={handleSubmit}>
        <TextField
          label="Username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <TextField
          label="Parolă"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && <p className="form__error">{error}</p>}
        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Se autentifică...' : 'Sign In'}
        </button>
        <div className="auth-footer">
          <Link to="/register" className="btn btn--create">
            Create Account
          </Link>
        </div>
      </form>
    </AuthCard>
  );
};

export default LoginPage;

