import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register({ username, email, password });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Înregistrarea a eșuat, încearcă din nou'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Creează un cont"
      subtitle="Vei primi un token JWT imediat după înregistrare."
      footer={
        <div className="auth-footer">
          <p className="auth-footer__text">Ai deja cont?</p>
          <Link to="/login" className="btn btn--outline">
            Sign In
          </Link>
        </div>
      }
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
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          label="Parolă"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && <p className="form__error">{error}</p>}
        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Se creează cont...' : 'Înregistrare'}
        </button>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;

