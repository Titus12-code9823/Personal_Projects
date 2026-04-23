import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import TokenPreview from '../components/TokenPreview';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

type Status = 'idle' | 'loading' | 'success' | 'error';

const DashboardPage = () => {
  const { token } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const testProtectedRequest = async () => {
    setStatus('loading');
    setMessage('Se interoghează backend-ul...');
    try {
      const songs = await apiClient.get<unknown>('/songs', { auth: true });
      const count = Array.isArray(songs) ? songs.length : 0;
      setStatus('success');
      setMessage(`Cererea protejată a reușit (${count} rezultate).`);
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Cererea protejată a eșuat. Verifică backend-ul.'
      );
    }
  };

  return (
    <div className="page page--dashboard">
      <AppHeader />
      <section className="panel">
        <div>
          <h2>Tokenul tău</h2>
          <p>
            Orice endpoint în afară de <code>/auth/**</code> are nevoie de
            acest token. Poți folosi butonul de mai jos pentru a-l copia în
            Postman/Thunder Client.
          </p>
        </div>
        <TokenPreview token={token} />
      </section>

      <section className="panel">
        <div>
          <h2>Testează o cerere protejată</h2>
          <p>
            Butonul trimite <code>GET /songs</code>. Dacă backend-ul rulează și
            tokenul este valid, răspunsul ar trebui să fie 200.
          </p>
        </div>
        <div className="panel__actions">
          <button
            className="btn"
            type="button"
            onClick={testProtectedRequest}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Se apelează...' : 'Trimite cerere'}
          </button>
          {message && (
            <p
              className={`panel__status panel__status--${status}`}
              role="status"
            >
              {message}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

