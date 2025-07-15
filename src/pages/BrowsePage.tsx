import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { createClient } from '@blinkdotnew/sdk'
import { Search, Filter } from 'lucide-react'
import Navigation from '../components/Navigation'
import ContentGrid from '../components/ContentGrid'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

const blink = createClient({
  projectId: 'movie-streaming-platform-dul9vz48',
  authRequired: true
})

interface BrowsePageProps {
  user: any
}

export default function BrowsePage({ user }: BrowsePageProps) {
  const { type } = useParams()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [sortBy, setSortBy] = useState('newest')
  const [genreFilter, setGenreFilter] = useState('all')

  const getOrderBy = useCallback(() => {
    switch (sortBy) {
      case 'newest':
        return { createdAt: 'desc' }
      case 'oldest':
        return { createdAt: 'asc' }
      case 'title':
        return { title: 'asc' }
      case 'rating':
        return { rating: 'desc' }
      default:
        return { createdAt: 'desc' }
    }
  }, [sortBy])

  const loadContent = useCallback(async () => {
    setLoading(true)
    try {
      let contentData = []
      
      if (type === 'movies' || type === 'search') {
        const movies = await blink.db.movies.list({
          limit: 50,
          orderBy: getOrderBy()
        })
        contentData = [...contentData, ...movies.map(item => ({ ...item, type: 'movie' }))]
      }
      
      if (type === 'tv-shows' || type === 'search') {
        const tvShows = await blink.db.tvShows.list({
          limit: 50,
          orderBy: getOrderBy()
        })
        contentData = [...contentData, ...tvShows.map(item => ({ ...item, type: 'tv_show' }))]
      }

      // Apply search filter
      if (searchQuery) {
        contentData = contentData.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.genre && item.genre.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }

      // Apply genre filter
      if (genreFilter !== 'all') {
        contentData = contentData.filter(item =>
          item.genre && item.genre.toLowerCase().includes(genreFilter.toLowerCase())
        )
      }

      setContent(contentData)
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }, [type, searchQuery, genreFilter, getOrderBy])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (localSearchQuery.trim()) {
      window.location.href = `/browse/search?q=${encodeURIComponent(localSearchQuery)}`
    }
  }

  const getPageTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`
    }
    switch (type) {
      case 'movies':
        return 'Movies'
      case 'tv-shows':
        return 'TV Shows'
      default:
        return 'Browse'
    }
  }

  const genres = [
    'all', 'action', 'adventure', 'comedy', 'drama', 'horror', 
    'thriller', 'sci-fi', 'fantasy', 'romance', 'documentary'
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-6">
              {getPageTitle()}
            </h1>
            
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search content..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* Filters */}
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filters:</span>
                </div>
                
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <ContentGrid items={content} />
          )}

          {/* No Results */}
          {!loading && content.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-4">No Content Found</h2>
              <p className="text-muted-foreground mb-8">
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try adjusting your search terms or filters.`
                  : 'No content available in this category yet.'
                }
              </p>
              {searchQuery && (
                <Button onClick={() => window.location.href = '/browse/movies'}>
                  Browse All Movies
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}