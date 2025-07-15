import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createClient } from '@blinkdotnew/sdk'
import { Play, Info } from 'lucide-react'
import { Button } from '../components/ui/button'
import ContentCarousel from '../components/ContentCarousel'
import Navigation from '../components/Navigation'

const blink = createClient({
  projectId: 'movie-streaming-platform-dul9vz48',
  authRequired: false
})

export default function HomePage() {
  const [movies, setMovies] = useState([])
  const [tvShows, setTvShows] = useState([])
  const [featuredContent, setFeaturedContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const [moviesData, tvShowsData] = await Promise.all([
        blink.db.movies.list({ limit: 20, orderBy: { createdAt: 'desc' } }),
        blink.db.tvShows.list({ limit: 20, orderBy: { createdAt: 'desc' } })
      ])

      setMovies(moviesData)
      setTvShows(tvShowsData)
      
      // Set featured content (first movie or TV show)
      if (moviesData.length > 0) {
        setFeaturedContent({ ...moviesData[0], type: 'movie' })
      } else if (tvShowsData.length > 0) {
        setFeaturedContent({ ...tvShowsData[0], type: 'tv_show' })
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      {featuredContent && (
        <div className="relative h-screen">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${featuredContent.backdropUrl || featuredContent.posterUrl || 'https://images.unsplash.com/photo-1489599511986-c2e0e5b8b5c2?w=1920&h=1080&fit=crop'})`,
            }}
          >
            <div className="absolute inset-0 netflix-gradient"></div>
          </div>
          
          <div className="relative z-10 flex items-center h-full">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                  {featuredContent.title}
                </h1>
                <p className="text-lg lg:text-xl text-gray-300 mb-8 line-clamp-3">
                  {featuredContent.description || 'Experience premium entertainment with our vast collection of movies and TV shows.'}
                </p>
                
                <div className="flex gap-4">
                  <Link to={`/watch/${featuredContent.id}`}>
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold">
                      <Play className="w-5 h-5 mr-2" />
                      Play
                    </Button>
                  </Link>
                  <Button size="lg" variant="secondary" className="bg-gray-600/70 hover:bg-gray-600/90 text-white">
                    <Info className="w-5 h-5 mr-2" />
                    More Info
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-32 hero-gradient"></div>
        </div>
      )}

      {/* Content Sections */}
      <div className="relative z-20 -mt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8 space-y-12">
          {movies.length > 0 && (
            <ContentCarousel
              title="Popular Movies"
              items={movies}
              type="movie"
            />
          )}
          
          {tvShows.length > 0 && (
            <ContentCarousel
              title="TV Shows"
              items={tvShows}
              type="tv_show"
            />
          )}
          
          {movies.length === 0 && tvShows.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-4">No Content Available</h2>
              <p className="text-muted-foreground mb-8">
                There's no content to display yet. Contact an administrator to add movies and TV shows.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}