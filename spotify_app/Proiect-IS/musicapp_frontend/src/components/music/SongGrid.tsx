import { Song } from '../../types/music';
import SongCard from './SongCard';

interface SongGridProps {
  title: string;
  songs: Song[];
  emptyMessage?: string;
}

const SongGrid = ({ title, songs, emptyMessage }: SongGridProps) => (
  <section className="section">
    <header className="section__header">
      <h2>{title}</h2>
    </header>
    {songs.length === 0 ? (
      <p className="section__empty">{emptyMessage ?? 'Nu există rezultate.'}</p>
    ) : (
      <div className="song-grid">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    )}
  </section>
);

export default SongGrid;

