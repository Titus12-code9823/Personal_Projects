import { useEffect, useState } from 'react';
import SongGrid from '../components/music/SongGrid';
import { Song, Artist } from '../types/music';
import * as songService from '../services/songService';
import * as artistService from '../services/artistService';

const HomePage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [songsPayload, artistsPayload] = await Promise.all([
          songService.fetchSongs(),
          artistService.fetchArtists()
        ]);
        setSongs(songsPayload);
        setArtists(artistsPayload);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Nu s-a putut încărca conținutul.'
        );
      }
    };
    loadData();
  }, []);

  const featured = songs.slice(0, 6);
  const fresh = songs.slice(6, 12);

  return (
    <div className="view">
      {error && <p className="form__error">{error}</p>}
      <SongGrid
        title="Recomandate pentru tine"
        songs={featured}
        emptyMessage="Adaugă câteva melodii în backend pentru a le vedea aici."
      />
      <SongGrid title="Lansări recente" songs={fresh} />
      <section className="section">
        <header className="section__header">
          <h2>Artiști populari</h2>
        </header>
        <div className="artist-grid">
          {artists.slice(0, 6).map((artist) => (
            <article key={artist.id} className="artist-card">
              <div className="artist-card__avatar">{artist.name.charAt(0)}</div>
              <div>
                <h3>{artist.name}</h3>
                {artist.genre && <small>{artist.genre}</small>}
              </div>
            </article>
          ))}
          {artists.length === 0 && (
            <p className="section__empty">Nu există artiști încă.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

