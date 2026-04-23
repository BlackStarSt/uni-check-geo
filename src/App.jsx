import './App.css';

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import Login from './pages/Login';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import Profile from './pages/Profile';
import Events from './pages/Events';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loader-visual">
          <div className="dot"></div>
          <div className="outline"></div>
        </div>
        <p className="loading-text">Carregando...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={user ? <Home /> : <Navigate to="/" replace />}
        />
        <Route
          path="/check-in/:id"
          element={user ? <CheckIn /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile/:id"
          element={user ? <Profile /> : <Navigate to="/" replace />}
        />
        <Route
          path="/events"
          element={user ? <Events /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App