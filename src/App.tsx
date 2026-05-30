import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/registerPage/register/Register'
import Header from './pages/HomePage/Header'
  
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
