import { FormEvent, useEffect, useState } from 'react';
import { Artist } from '../types/music';
import * as songService from '../services/songService';
import * as artistService from '../services/artistService';

const CreatePage = () => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(180);
  const [albumId, setAlbumId] = useState<number | ''>('');
  const [selectedArtists, setSelectedArtists] = useState<number[]>([]);
  const [s3Key, setS3Key] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadArtists = async () => {
      try {
        const data = await artistService.fetchArtists();
        setArtists(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Nu s-a putut încărca lista de artiști.'
        );
      }
    };
    loadArtists();
  }, []);

  const toggleArtist = (id: number) => {
    setSelectedArtists((prev) =>
      prev.includes(id) ? prev.filter((artistId) => artistId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!albumId) {
      setError('Trebuie să completezi albumId (din backend).');
      return;
    }
    if (selectedArtists.length === 0) {
      setError('Selectează cel puțin un artist.');
      return;
    }

    setIsSubmitting(true);
    try {
      await songService.createSong({
        title,
        duration,
        albumId: Number(albumId),
        artistIds: selectedArtists,
        s3Key: s3Key || undefined
      });
      setMessage('Piesa a fost creată cu succes!');
      setTitle('');
      setDuration(180);
      setAlbumId('');
      setSelectedArtists([]);
      setS3Key('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Crearea piesei a eșuat.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="view view--form">
      <h2>Creează o piesă nouă</h2>
      <form className="form form--panel" onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-field__label">Titlu piesă</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">Durată (secunde)</span>
          <input
            type="number"
            min={30}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            required
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">Album ID (din backend)</span>
          <input
            type="number"
            value={albumId}
            onChange={(event) => setAlbumId(event.target.value ? Number(event.target.value) : '')}
            required
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">Cheie S3 (opțional)</span>
          <input
            value={s3Key}
            onChange={(event) => setS3Key(event.target.value)}
            placeholder="ex: uploads/piesa-demo.mp3"
          />
        </label>
        <div className="form-field">
          <span className="form-field__label">Artiști</span>
          <div className="artist-select">
            {artists.map((artist) => (
              <label key={artist.id}>
                <input
                  type="checkbox"
                  checked={selectedArtists.includes(artist.id)}
                  onChange={() => toggleArtist(artist.id)}
                />
                {artist.name}
              </label>
            ))}
            {artists.length === 0 && (
              <p className="section__empty">
                Adaugă artiști în backend pentru a-i vedea aici.
              </p>
            )}
          </div>
        </div>
        {error && <p className="form__error">{error}</p>}
        {message && <p className="form__success">{message}</p>}
        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Se salvează...' : 'Crează piesa'}
        </button>
      </form>
    </div>
  );
};

export default CreatePage;

