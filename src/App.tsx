import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/registerPage/register/Register'
import Welcome from './pages/registerPage/Welcome'
import Header from './pages/HomePage/Header'
import HomePage from './pages/HomePage/HomePage'
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage'
  
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Header />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
