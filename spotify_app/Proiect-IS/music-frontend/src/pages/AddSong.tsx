import { useState, useEffect } from "react";
import { createSong, finalizeSong, type CreateSongRequest } from "../services/songService";
import { getAllArtists, type Artist } from "../services/artistService";
import { getAllAlbums, createAlbum, type Album } from "../services/albumService";
import { getUploadUrl, uploadToS3 } from "../services/mediaService";
import { useNavigate } from "react-router-dom";

const AddSong = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<number[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Album creation modal state
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumYear, setNewAlbumYear] = useState(new Date().getFullYear().toString());
  const [newAlbumArtistId, setNewAlbumArtistId] = useState("");
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistsData, albumsData] = await Promise.all([
          getAllArtists(),
          getAllAlbums(),
        ]);
        setArtists(artistsData);
        setAlbums(albumsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load artists or albums.");
      }
    };
    fetchData();
  }, []);

  const handleArtistToggle = (artistId: number) => {
    setSelectedArtists((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId]
    );
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumTitle.trim()) {
      setError("Album title is required.");
      return;
    }
    if (!newAlbumArtistId) {
      setError("Please select an artist for the album.");
      return;
    }

    setCreatingAlbum(true);
    setError("");
    try {
      const newAlbum = await createAlbum({
        title: newAlbumTitle.trim(),
        releaseYear: parseInt(newAlbumYear) || new Date().getFullYear(),
        artistId: parseInt(newAlbumArtistId),
      });
      
      // Refresh albums list
      const updatedAlbums = await getAllAlbums();
      setAlbums(updatedAlbums);
      
      // Select the newly created album
      setAlbumId(newAlbum.id.toString());
      
      // Close modal and reset form
      setShowAlbumModal(false);
      setNewAlbumTitle("");
      setNewAlbumYear(new Date().getFullYear().toString());
      setNewAlbumArtistId("");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to create album.");
      console.error(err);
    } finally {
      setCreatingAlbum(false);
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(Math.floor(audio.duration));
      };
      audio.onerror = reject;
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploadProgress("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!albumId) {
      setError("Album is required.");
      return;
    }
    if (selectedArtists.length === 0) {
      setError("At least one artist is required.");
      return;
    }

    setLoading(true);
    try {
      let finalS3Key: string | undefined;
      let finalDuration = parseInt(duration) || 0;

      // If audio file is provided, try to upload it
      if (audioFile) {
        try {
          setUploadProgress("Getting upload URL...");
          const { s3Key: uploadedS3Key, uploadUrl } = await getUploadUrl(audioFile);
          console.log("Got upload URL, s3Key:", uploadedS3Key);
          
          setUploadProgress("Uploading file to S3...");
          await uploadToS3(audioFile, uploadUrl);
          console.log("File uploaded to S3 successfully");
          
          finalS3Key = uploadedS3Key;
          setUploadProgress("File uploaded successfully!");
          console.log("Final s3Key before creating song:", finalS3Key);

          // Try to get duration from file if not provided
          if (!finalDuration || finalDuration < 1) {
            try {
              finalDuration = await getAudioDuration(audioFile);
              setUploadProgress("Extracted duration from file.");
            } catch (err) {
              console.warn("Could not extract duration from file:", err);
            }
          }
        } catch (uploadError: any) {
          console.error("Upload error details:", uploadError);
          console.error("Upload error response:", uploadError.response);
          // If AWS is not configured, allow creating song without file
          const errorMsg = uploadError.response?.data?.detail || 
                          uploadError.response?.data?.message || 
                          uploadError.message || 
                          "";
          console.log("Error message:", errorMsg);
          
          // Check for AWS credential errors
          const isAwsError = errorMsg.includes("credentials") || 
                           errorMsg.includes("AWS") || 
                           errorMsg.includes("Unable to load credentials") ||
                           errorMsg.includes("S3") ||
                           uploadError.response?.status === 500;
          
          if (isAwsError) {
            console.warn("AWS not configured, creating song without audio file:", uploadError);
            setUploadProgress("AWS not configured. Creating song without audio file...");
            setError("⚠️ AWS S3 is not configured. The song will be created WITHOUT audio file. To enable audio uploads, configure AWS credentials in the backend. Check the browser console for details.");
            // Continue without S3 upload - finalS3Key remains undefined
          } else {
            // For other errors, show them and stop
            setError(`Upload failed: ${errorMsg || "Unknown error"}`);
            setLoading(false);
            return;
          }
        }
      }

      if (!finalDuration || finalDuration < 1) {
        setError("Duration is required. Please provide duration or upload an audio file.");
        setLoading(false);
        return;
      }

      setUploadProgress("Creating song...");
      const songData: CreateSongRequest = {
        title: title.trim(),
        duration: finalDuration,
        albumId: parseInt(albumId),
        artistIds: selectedArtists,
        s3Key: finalS3Key,
      };

      console.log("Creating song with data:", { ...songData, s3Key: finalS3Key ? "present" : "missing" });

      // Use finalize if we uploaded a file, otherwise use regular create
      let createdSong;
      if (finalS3Key) {
        console.log("Using finalize endpoint with s3Key:", finalS3Key);
        createdSong = await finalizeSong(songData);
      } else {
        console.log("Using regular create endpoint (no s3Key)");
        createdSong = await createSong(songData);
      }

      console.log("Song created successfully:", createdSong);
      console.log("Created song s3Key:", createdSong.s3Key);

      navigate("/");
    } catch (err: any) {
      console.error("Error creating song:", err);
      
      // Try to extract detailed error message
      let errorMessage = "Failed to create song.";
      
      if (err.response) {
        // Backend returned an error response
        const data = err.response.data;
        if (data?.detail) {
          errorMessage = data.detail;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data?.title) {
          errorMessage = `${data.title}: ${data.detail || 'Unknown error'}`;
        } else {
          errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-white">Add New Song</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Duration (seconds) {audioFile ? "(optional - will be extracted from file)" : "*"}
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none"
            required={!audioFile}
          />
          {audioFile && (
            <p className="text-xs text-zinc-400 mt-1">
              Duration will be automatically extracted from the audio file if not provided.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-zinc-300">
              Album *
            </label>
            <button
              type="button"
              onClick={() => setShowAlbumModal(true)}
              className="text-xs text-green-400 hover:text-green-300 underline"
            >
              + Create New Album
            </button>
          </div>
          <select
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none"
            required
          >
            <option value="">Select an album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Artists * (select at least one)
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto bg-zinc-800 p-4 rounded-lg border border-zinc-700">
            {artists.length === 0 ? (
              <p className="text-zinc-400 text-sm">No artists available. Create artists first.</p>
            ) : (
              artists.map((artist) => (
                <label
                  key={artist.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedArtists.includes(artist.id)}
                    onChange={() => handleArtistToggle(artist.id)}
                    className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                  />
                  <span className="text-white">{artist.name}</span>
                  {artist.genre && (
                    <span className="text-xs text-zinc-400">({artist.genre})</span>
                  )}
                </label>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Audio File (MP3) (optional)
          </label>
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAudioFile(file);
                // Auto-fill title if empty
                if (!title.trim()) {
                  setTitle(file.name.replace(/\.[^/.]+$/, ""));
                }
              } else {
                setAudioFile(null);
              }
            }}
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-400 file:cursor-pointer"
          />
          {audioFile && (
            <p className="text-xs text-zinc-400 mt-1">
              Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          <p className="text-xs text-zinc-400 mt-1">
            {audioFile 
              ? "Upload an MP3 file. Duration will be extracted automatically if possible."
              : "Optional: Upload an MP3 file. You can create a song without audio file for testing."}
          </p>
        </div>

        {uploadProgress && (
          <div className="bg-blue-500/10 border border-blue-500 text-blue-400 p-3 rounded-lg text-sm">
            {uploadProgress}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (uploadProgress || "Creating...") : "Create Song"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Create Album Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 border border-zinc-700">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Album</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Album Title *
                </label>
                <input
                  type="text"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none"
                  placeholder="Enter album title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Release Year *
                </label>
                <input
                  type="number"
                  value={newAlbumYear}
                  onChange={(e) => setNewAlbumYear(e.target.value)}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Artist *
                </label>
                <select
                  value={newAlbumArtistId}
                  onChange={(e) => setNewAlbumArtistId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select an artist</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handleCreateAlbum}
                disabled={creatingAlbum}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition flex-1"
              >
                {creatingAlbum ? "Creating..." : "Create Album"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAlbumModal(false);
                  setNewAlbumTitle("");
                  setNewAlbumYear(new Date().getFullYear().toString());
                  setNewAlbumArtistId("");
                  setError("");
                }}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSong;
