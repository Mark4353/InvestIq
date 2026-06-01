import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/registerPage/register/Register'
import Welcome from './pages/registerPage/Welcome'
import Header from './pages/HomePage/Header'
import HomePage from './pages/HomePage/HomePage'
  
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
