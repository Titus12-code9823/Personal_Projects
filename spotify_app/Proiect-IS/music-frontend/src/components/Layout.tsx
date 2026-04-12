import type { ReactNode } from "react";
import { Home, Search, Library, PlusCircle, LogOut, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AudioPlayer from "./AudioPlayer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {/* Top Section: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR (Left) */}
        <aside className="w-64 bg-zinc-900 p-6 flex flex-col gap-6">
          <div className="text-2xl font-bold mb-4">MusicApp</div>

          <nav className="flex flex-col gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 hover:text-green-400 transition"
            >
              <Home size={24} /> Home
            </Link>
            <Link
              to="/search"
              className="flex items-center gap-3 hover:text-green-400 transition"
            >
              <Search size={24} /> Search
            </Link>
            <Link
              to="/library"
              className="flex items-center gap-3 hover:text-green-400 transition"
            >
              <Library size={24} /> Your Library
            </Link>
            <Link
              to="/add-song"
              className="flex items-center gap-3 hover:text-green-400 transition"
            >
              <PlusCircle size={24} /> Add Song
            </Link>
            <Link
              to="/artists"
              className="flex items-center gap-3 hover:text-green-400 transition"
            >
              <Users size={24} /> Artists
            </Link>
          </nav>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 uppercase text-xs tracking-wider">
                Playlists
              </span>
              <button className="hover:text-white text-gray-400">
                <PlusCircle size={20} />
              </button>
            </div>
            {/* Playlist list will go here later */}
            <div className="text-sm text-gray-500 overflow-y-auto h-32 space-y-2">
              <p className="hover:text-white cursor-pointer">Chill Vibes</p>
              <p className="hover:text-white cursor-pointer">Coding Focus</p>
              <p className="hover:text-white cursor-pointer">Gym Hype</p>
            </div>
          </div>

          {/* Logout at bottom of sidebar */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA (Center) */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-800 to-black p-8">
          {children}
        </main>
      </div>

      {/* PLAYER BAR (Bottom - Fixed) */}
      <AudioPlayer />
    </div>
  );
};

export default Layout;
