import { useEffect, useState } from 'react';
import SongGrid from '../components/music/SongGrid';
import { Song } from '../types/music';
import * as songService from '../services/songService';

const LibraryPage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await songService.fetchSongs();
        setSongs(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Nu s-a putut încărca biblioteca ta.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="view">
      {isLoading && <p>Se încarcă biblioteca...</p>}
      {error && <p className="form__error">{error}</p>}
      <SongGrid
        title="Colecția ta"
        songs={songs}
        emptyMessage="Nu există piese salvate încă."
      />
    </div>
  );
};

export default LibraryPage;

