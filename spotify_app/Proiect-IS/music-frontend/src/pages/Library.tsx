import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPlaylists, createPlaylist, deletePlaylist, type Playlist } from "../services/playlistService";
import { PlusCircle, Trash2 } from "lucide-react";

const Library = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setError(""); // Clear previous errors
      const data = await getMyPlaylists();
      setPlaylists(data);
    } catch (err: any) {
      console.error("Error loading playlists:", err);
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.message || 
                      err.message || 
                      "Failed to load playlists.";
      setError(errorMsg);
      // Still allow creating playlists even if loading fails
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      setError(""); // Clear previous errors
      const newPlaylist = await createPlaylist({ name: newPlaylistName });
      setNewPlaylistName("");
      setShowCreateForm(false);
      // Add the new playlist to the list immediately
      setPlaylists((prev) => [...prev, newPlaylist]);
      // Also refresh from server to get full data
      fetchPlaylists();
    } catch (err: any) {
      console.error("Error creating playlist:", err);
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.message || 
                      err.message || 
                      "Failed to create playlist.";
      setError(errorMsg);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      await deletePlaylist(id);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
      setError("Failed to delete playlist.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Your Library</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 rounded-lg font-bold transition"
        >
          <PlusCircle size={20} /> Create Playlist
        </button>
      </div>

      {loading && <div className="p-8 text-white">Loading playlists...</div>}
      
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreatePlaylist} className="mb-6 p-4 bg-zinc-800 rounded-lg">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Playlist name"
            className="w-full px-4 py-2 rounded-lg bg-zinc-700 text-white border border-zinc-600 focus:border-green-500 focus:outline-none mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-400 rounded-lg font-bold"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewPlaylistName("");
              }}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!loading && (
        <>
          {playlists.length === 0 ? (
            <div className="text-zinc-400 text-center py-12">
              <p className="mb-4">You don't have any playlists yet.</p>
              <p>Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="bg-zinc-800/40 p-6 rounded-lg hover:bg-zinc-800 transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{playlist.name}</h3>
                      <p className="text-sm text-zinc-400">
                        {playlist.songIds?.length || 0} song{playlist.songIds?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="h-32 bg-zinc-700 rounded flex items-center justify-center text-zinc-500">
                    <p className="text-sm">Playlist cover</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Library;
