import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated background elements - Red, Black, Gold theme */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-primary-600/15 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-secondary-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/8 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-10 right-1/4 w-80 h-80 bg-secondary-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
