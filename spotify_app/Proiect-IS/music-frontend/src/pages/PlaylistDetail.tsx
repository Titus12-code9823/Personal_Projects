import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlaylist, addSongToPlaylist, removeSongFromPlaylist, type Playlist } from "../services/playlistService";
import { getAllSongs, type Song } from "../services/songService";
import { Trash2, Plus } from "lucide-react";
import SongCard from "../components/SongCard";
import { usePlayer } from "../context/PlayerContext";

const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setQueue } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddSong, setShowAddSong] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [playlistData, allSongsData] = await Promise.all([
        getPlaylist(Number(id)),
        getAllSongs(),
      ]);
      setPlaylist(playlistData);
      setAllSongs(allSongsData);

      // Get songs that are in the playlist
      if (playlistData.songIds && playlistData.songIds.length > 0) {
        const playlistSongs = allSongsData.filter((song) =>
          playlistData.songIds?.includes(song.id)
        );
        setSongs(playlistSongs);
      } else {
        setSongs([]);
      }
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load playlist.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = async (songId: number) => {
    if (!id) return;

    try {
      const updatedPlaylist = await addSongToPlaylist(Number(id), songId);
      setPlaylist(updatedPlaylist);
      fetchData(); // Refresh to get updated song list
      setShowAddSong(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add song to playlist.");
    }
  };

  const handleRemoveSong = async (songId: number) => {
    if (!id) return;

    try {
      const updatedPlaylist = await removeSongFromPlaylist(Number(id), songId);
      setPlaylist(updatedPlaylist);
      fetchData(); // Refresh to get updated song list
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to remove song from playlist.");
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs);
      // Will auto-play first song via player context
    }
  };

  if (loading) return <div className="p-8 text-white">Loading playlist...</div>;
  if (error && !playlist) return <div className="p-8 text-red-500">{error}</div>;
  if (!playlist) return <div className="p-8 text-white">Playlist not found</div>;

  const availableSongs = allSongs.filter(
    (song) => !playlist.songIds?.includes(song.id)
  );

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate("/library")}
          className="text-zinc-400 hover:text-white mb-4"
        >
          ← Back to Library
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">{playlist.name}</h1>
        <p className="text-zinc-400">
          {songs.length} song{songs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        {songs.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 rounded-lg font-bold transition"
          >
            Play All
          </button>
        )}
        <button
          onClick={() => setShowAddSong(!showAddSong)}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold transition"
        >
          <Plus size={20} /> Add Songs
        </button>
      </div>

      {showAddSong && (
        <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Add Songs to Playlist</h3>
          {availableSongs.length === 0 ? (
            <p className="text-zinc-400">All songs are already in this playlist.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {availableSongs.map((song) => (
                <div key={song.id} className="relative">
                  <SongCard song={song} />
                  <button
                    onClick={() => handleAddSong(song.id)}
                    className="absolute top-2 right-2 bg-green-500 hover:bg-green-400 rounded-full p-2 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {songs.length === 0 ? (
        <div className="text-zinc-400 text-center py-12">
          <p className="mb-4">This playlist is empty.</p>
          <p>Add songs to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center gap-4 p-4 bg-zinc-800/40 hover:bg-zinc-800 rounded-lg group"
            >
              <span className="text-zinc-400 w-8">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{song.title}</p>
                <p className="text-sm text-zinc-400 truncate">
                  {song.artistNames?.join(", ") || "Unknown Artist"}
                </p>
              </div>
              <button
                onClick={() => handleRemoveSong(song.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
