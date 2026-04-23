import { useState } from "react";
import { searchSongs, type Song } from "../services/songService";
import SongCard from "../components/SongCard";

const Search = () => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"title" | "artist">("title");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    try {
      const results = await searchSongs(query, searchType);
      setSongs(results);
    } catch (err) {
      setError("Failed to search songs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Search</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs..."
            className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none"
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "title" | "artist")}
            className="px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none"
          >
            <option value="title">By Title</option>
            <option value="artist">By Artist</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {songs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">
            Found {songs.length} song{songs.length !== 1 ? "s" : ""}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {!loading && query && songs.length === 0 && !error && (
        <div className="text-zinc-400 text-center py-12">
          No songs found. Try a different search.
        </div>
      )}
    </div>
  );
};

export default Search;
