import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";

// 1. Create a "Protected Route" component
// If not logged in, force them to /login
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Pages
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import AddSong from "./pages/AddSong";
import Artists from "./pages/Artists";
import PlaylistDetail from "./pages/PlaylistDetail";

// We need a Real Login Page now (Simple version for testing)

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate(); // <--- 1. Get the navigation function

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 2. Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      await login({ username, password });
      // 3. Explicitly move to Home on success
      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-zinc-900 p-8 rounded text-black w-80"
      >
        <h2 className="text-white text-2xl font-bold mb-4">Log In</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded text-sm">
            {error}
          </div>
        )}

        <input
          className="p-3 rounded bg-zinc-800 text-white border border-transparent focus:border-green-500 outline-none transition"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="p-3 rounded bg-zinc-800 text-white border border-transparent focus:border-green-500 outline-none transition"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-green-500 p-3 rounded font-bold hover:bg-green-400 transition mt-2">
          Sign In
        </button>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="bg-transparent border-2 border-white text-white p-3 rounded font-bold hover:bg-white hover:text-black transition mt-2"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register({ username, email, password });
      navigate("/");
    } catch (err) {
      setError("Registration failed. Username or email may already exist.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-zinc-900 p-8 rounded text-black w-80"
      >
        <h2 className="text-white text-2xl font-bold mb-4">Create Account</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded text-sm">
            {error}
          </div>
        )}

        <input
          className="p-3 rounded bg-zinc-800 text-white border border-transparent focus:border-green-500 outline-none transition"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="p-3 rounded bg-zinc-800 text-white border border-transparent focus:border-green-500 outline-none transition"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="p-3 rounded bg-zinc-800 text-white border border-transparent focus:border-green-500 outline-none transition"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-green-500 p-3 rounded font-bold hover:bg-green-400 transition mt-2">
          Register
        </button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="bg-transparent border-2 border-white text-white p-3 rounded font-bold hover:bg-white hover:text-black transition mt-2"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Wrapped in Layout) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Layout>
                  <Search />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Layout>
                  <Library />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-song"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddSong />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/artists"
            element={
              <ProtectedRoute>
                <Layout>
                  <Artists />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlist/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaylistDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
