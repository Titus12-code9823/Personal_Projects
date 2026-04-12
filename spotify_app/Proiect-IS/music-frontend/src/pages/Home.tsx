import { useEffect, useState } from "react";
import { getAllSongs, type Song } from "../services/songService";
import SongCard from "../components/SongCard";
import { usePlayer } from "../context/PlayerContext";

const Home = () => {
  const { setQueue } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await getAllSongs();
        console.log("Fetched songs:", data);
        // Log s3Key for each song
        data.forEach((song) => {
          console.log(`Song "${song.title}" (ID: ${song.id}) - s3Key:`, song.s3Key || "MISSING");
        });
        setSongs(data);
        setQueue(data); // Set all songs as queue
      } catch (err) {
        console.error(err); // Log for debugging
        setError("Failed to load songs.");
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [setQueue]);

  if (loading)
    return <div className="p-8 text-white">Loading your music...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Good Afternoon</h1>

      {/* Grid Layout for Songs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

export default Home;
