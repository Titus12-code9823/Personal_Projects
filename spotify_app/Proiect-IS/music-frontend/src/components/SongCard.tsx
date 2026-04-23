import { useState, useEffect } from "react";
import { Music, Plus } from "lucide-react";
import type { Song } from "../services/songService";
import { getArtistName } from "../services/songService";
import { usePlayer } from "../context/PlayerContext";
import { getMyPlaylists, addSongToPlaylist, type Playlist } from "../services/playlistService";

interface SongCardProps {
  song: Song;
  onClick?: () => void;
}

const SongCard = ({ song, onClick }: SongCardProps) => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const artistName = getArtistName(song);
  const duration = song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : '';
  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;
  const hasAudio = !!song.s3Key;
  
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (showPlaylistModal) {
      fetchPlaylists();
    }
  }, [showPlaylistModal]);

  const fetchPlaylists = async () => {
    try {
      const data = await getMyPlaylists();
      setPlaylists(data);
    } catch (err) {
      console.error("Failed to load playlists:", err);
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    setAdding(true);
    try {
      await addSongToPlaylist(playlistId, song.id);
      setShowPlaylistModal(false);
      // Could show a success message here
    } catch (err: any) {
      console.error("Failed to add song to playlist:", err);
      alert(err.response?.data?.message || "Failed to add song to playlist");
    } finally {
      setAdding(false);
    }
  };

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasAudio) {
      return; // Don't play if no audio file
    }
    if (isCurrentlyPlaying) {
      // If clicking on currently playing song, could pause/resume
      // For now, just play it again
    }
    await playSong(song);
  };

  const handleAddToPlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPlaylistModal(true);
  };

  return (
    <div 
      className={`bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-800 transition cursor-pointer group ${
        isCurrentlyPlaying ? 'ring-2 ring-green-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative aspect-square mb-4 bg-zinc-700 rounded-md flex items-center justify-center shadow-lg overflow-hidden">
        {/* Fallback icon if no image yet */}
        <Music size={48} className="text-zinc-500" />

        {/* Play Button Overlay (appears on hover) */}
        {hasAudio ? (
          <button
            onClick={handlePlay}
            className={`absolute right-2 bottom-2 bg-green-500 rounded-full p-3 ${
              isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            } translate-y-2 group-hover:translate-y-0 transition-all shadow-xl text-black hover:scale-110`}
            title="Play song"
          >
            <svg
              role="img"
              height="24"
              width="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path>
            </svg>
          </button>
        ) : (
          <div
            className="absolute right-2 bottom-2 bg-zinc-700/90 rounded px-2 py-1 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
            title="No audio file available"
          >
            No Audio
          </div>
        )}
        
        {/* Add to Playlist Button (appears on hover, top-left) */}
        <button
          onClick={handleAddToPlaylistClick}
          className="absolute left-2 top-2 bg-blue-500 rounded-full p-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl text-white hover:scale-110"
          title="Add to playlist"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <h3 className="font-bold truncate text-white flex-1">{song.title}</h3>
        {!hasAudio && (
          <span className="text-xs text-zinc-500 bg-zinc-700/50 px-2 py-0.5 rounded" title="No audio file">
            No Audio
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-400 truncate">{artistName}</p>
      {duration && <p className="text-xs text-zinc-500 mt-1">{duration}</p>}

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowPlaylistModal(false)}>
          <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-4">Add to Playlist</h2>
            <p className="text-zinc-400 mb-4 text-sm">Select a playlist to add "{song.title}"</p>
            
            {playlists.length === 0 ? (
              <div className="text-zinc-400 text-center py-8">
                <p className="mb-4">You don't have any playlists yet.</p>
                <p className="text-sm">Create a playlist from "Your Library" first.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {playlists.map((playlist) => {
                  const isAlreadyInPlaylist = playlist.songIds?.includes(song.id);
                  return (
                    <button
                      key={playlist.id}
                      onClick={() => !isAlreadyInPlaylist && handleAddToPlaylist(playlist.id)}
                      disabled={isAlreadyInPlaylist || adding}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        isAlreadyInPlaylist
                          ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                      } ${adding ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{playlist.name}</span>
                        {isAlreadyInPlaylist && (
                          <span className="text-xs text-zinc-500">Already added</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {playlist.songIds?.length || 0} song{playlist.songIds?.length !== 1 ? 's' : ''}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
                disabled={adding}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongCard;
