import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createClient } from '@blinkdotnew/sdk'
import { Search, Menu, User, LogOut, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const blink = createClient({
  projectId: 'movie-streaming-platform-dul9vz48',
  authRequired: true
})

interface NavigationProps {
  user: any
}

export default function Navigation({ user }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/browse/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('streamflix')

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/95 backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">StreamFlix</div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/' ? 'text-primary' : 'text-foreground'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/browse/movies" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/browse/movies' ? 'text-primary' : 'text-foreground'
              }`}
            >
              Movies
            </Link>
            <Link 
              to="/browse/tv-shows" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/browse/tv-shows' ? 'text-primary' : 'text-foreground'
              }`}
            >
              TV Shows
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/admin' ? 'text-primary' : 'text-foreground'
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Search and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search movies, TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-background/50 border-border/50 focus:bg-background"
                />
              </div>
            </form>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => blink.auth.logout()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}