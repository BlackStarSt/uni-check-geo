import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/check-in/:id" element={<CheckIn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App