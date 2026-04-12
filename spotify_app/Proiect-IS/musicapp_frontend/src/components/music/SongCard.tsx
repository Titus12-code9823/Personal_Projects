import { Song } from '../../types/music';

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
};

const SongCard = ({ song }: { song: Song }) => (
  <article className="song-card">
    <div className="song-card__artwork" aria-hidden>
      {song.title.charAt(0)}
    </div>
    <div className="song-card__meta">
      <h3>{song.title}</h3>
      <p>{song.artistNames.join(', ')}</p>
    </div>
    <span className="song-card__album">{song.albumTitle ?? 'Album necunoscut'}</span>
    <span className="song-card__duration">{formatDuration(song.duration)}</span>
  </article>
);

export default SongCard;

