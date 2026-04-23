import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { getArtistName } from "../services/songService";

const AudioPlayer = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    pause,
    resume,
    nextSong,
    previousSong,
    seek,
    setVolume,
  } = usePlayer();

  if (!currentSong) {
    return null;
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 1);
  };

  return (
    <div className="h-24 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-6 text-white">
      {/* Song Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-14 h-14 bg-zinc-700 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-zinc-400">🎵</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate">{currentSong.title}</p>
          <p className="text-sm text-zinc-400 truncate">
            {getArtistName(currentSong)}
          </p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={previousSong}
            className="hover:text-green-400 transition"
            disabled={isLoading}
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            className="bg-white text-black rounded-full p-2 hover:scale-110 transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </button>
          <button
            onClick={nextSong}
            className="hover:text-green-400 transition"
            disabled={isLoading}
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-zinc-400 w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <span className="text-xs text-zinc-400 w-12">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <button onClick={toggleMute} className="hover:text-green-400 transition">
          {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
