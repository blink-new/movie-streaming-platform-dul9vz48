import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { createClient } from '@blinkdotnew/sdk'
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Slider } from '../components/ui/slider'

const blink = createClient({
  projectId: 'movie-streaming-platform-dul9vz48',
  authRequired: true
})

interface WatchPageProps {
  user: any
}

export default function WatchPage({ user }: WatchPageProps) {
  const { id } = useParams()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([80])
  const [progress, setProgress] = useState([0])
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    if (id) {
      loadContent(id)
    }
  }, [id])

  const loadContent = async (contentId: string) => {
    try {
      // Try to find in movies first
      let contentData = await blink.db.movies.list({
        where: { id: contentId },
        limit: 1
      })

      let contentType = 'movie'
      
      // If not found in movies, try TV shows
      if (contentData.length === 0) {
        contentData = await blink.db.tvShows.list({
          where: { id: contentId },
          limit: 1
        })
        contentType = 'tv_show'
      }

      if (contentData.length > 0) {
        setContent({ ...contentData[0], type: contentType })
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    if (value[0] === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Content Not Found</h1>
          <p className="text-muted-foreground mb-8">The requested content could not be found.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player Container */}
      <div className="relative w-full h-screen">
        {/* Video Background */}
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          {content.videoUrl ? (
            <video
              className="w-full h-full object-cover"
              poster={content.backdropUrl || content.posterUrl}
              controls={false}
            >
              <source src={content.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center">
              <div 
                className="w-full h-full bg-cover bg-center flex items-center justify-center"
                style={{
                  backgroundImage: `url(${content.backdropUrl || content.posterUrl || 'https://images.unsplash.com/photo-1489599511986-c2e0e5b8b5c2?w=1920&h=1080&fit=crop'})`,
                }}
              >
                <div className="bg-black/60 p-8 rounded-lg text-center">
                  <h2 className="text-2xl font-semibold mb-4">Video Not Available</h2>
                  <p className="text-gray-300 mb-6">
                    The video for "{content.title}" is not currently available.
                  </p>
                  <p className="text-sm text-gray-400">
                    Please contact an administrator to add the video content.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
              </Link>
              
              <div className="text-white">
                <h1 className="text-xl font-semibold">{content.title}</h1>
                {content.year && (
                  <p className="text-sm text-gray-300">{content.year}</p>
                )}
              </div>
            </div>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              onClick={togglePlay}
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 rounded-full w-20 h-20"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={progress}
                  onValueChange={setProgress}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-300">
                  <span>0:00</span>
                  <span>{content.duration ? `${Math.floor(content.duration / 60)}:${(content.duration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted || volume[0] === 0 ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>
                    <div className="w-24">
                      <Slider
                        value={volume}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Info */}
      <div className="bg-background p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {content.description || 'No description available.'}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                {content.year && (
                  <div>
                    <span className="text-muted-foreground">Year: </span>
                    <span>{content.year}</span>
                  </div>
                )}
                {content.genre && (
                  <div>
                    <span className="text-muted-foreground">Genre: </span>
                    <span>{content.genre}</span>
                  </div>
                )}
                {content.rating && (
                  <div>
                    <span className="text-muted-foreground">Rating: </span>
                    <span>★ {content.rating.toFixed(1)}</span>
                  </div>
                )}
                {content.duration && (
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span>{Math.floor(content.duration / 60)}h {content.duration % 60}m</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <img
                src={content.posterUrl || 'https://images.unsplash.com/photo-1489599511986-c2e0e5b8b5c2?w=300&h=450&fit=crop'}
                alt={content.title}
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}