import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import SongGrid from '../components/music/SongGrid';
import { Song } from '../types/music';
import * as songService from '../services/songService';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await songService.searchSongs(query);
        if (!controller.signal.aborted) {
          setResults(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Căutarea a eșuat, încearcă din nou.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 400);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <div className="view">
      <div className="search-header">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Caută după titlu..."
        />
        {isLoading && <span className="search-header__status">Se caută...</span>}
      </div>
      {error && <p className="form__error">{error}</p>}
      <SongGrid
        title={
          query ? `Rezultate pentru „${query}”` : 'Începe o căutare pentru a vedea rezultate'
        }
        songs={results}
        emptyMessage={query ? 'Nicio piesă găsită.' : undefined}
      />
    </div>
  );
};

export default SearchPage;

