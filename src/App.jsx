import './App.css';

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import Login from './pages/Login';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Navigate to="/home" replace />} />
        <Route path='/login' element={!user ? <Login /> : <Navigate to="/home" replace />} />
        <Route 
          path="/home" 
          element={user ? <Home /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/check-in/:id" 
          element={user ? <CheckIn /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile/:id" 
          element={user ? <Profile /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App