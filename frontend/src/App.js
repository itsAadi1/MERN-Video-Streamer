import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getCurrentUser } from './services/api';
import { loginSuccess } from './store/slices/authSlice';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import VideoUpload from './pages/VideoUpload';
import VideoView from './pages/VideoView';
import Tweets from './pages/Tweets';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then((res) => {
          dispatch(loginSuccess({ user: res.data.data, token }));
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
          localStorage.removeItem('token');
        });
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/upload" element={
              <PrivateRoute>
                <VideoUpload />
              </PrivateRoute>
            } />
            <Route path="/video/:videoId" element={<VideoView />} />
            <Route path="/tweets" element={
              <PrivateRoute>
                <Tweets />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
