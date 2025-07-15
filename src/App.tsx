import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { createClient } from '@blinkdotnew/sdk'
import HomePage from './pages/HomePage'
import WatchPage from './pages/WatchPage'
import AdminDashboard from './pages/AdminDashboard'
import BrowsePage from './pages/BrowsePage'
import { Toaster } from 'sonner'

const blink = createClient({
  projectId: 'movie-streaming-platform-dul9vz48',
  authRequired: true
})

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading StreamFlix...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold text-primary mb-4">StreamFlix</h1>
          <p className="text-muted-foreground mb-8">Sign in to start watching movies and TV shows</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-md font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('streamflix')

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/browse/:type" element={<BrowsePage user={user} />} />
          <Route path="/watch/:id" element={<WatchPage user={user} />} />
          {isAdmin && (
            <Route path="/admin" element={<AdminDashboard user={user} />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App