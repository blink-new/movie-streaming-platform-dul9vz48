import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Plus, Star } from 'lucide-react'
import { Button } from './ui/button'

interface ContentItem {
  id: string
  title: string
  posterUrl?: string
  backdropUrl?: string
  description?: string
  year?: number
  rating?: number
  genre?: string
  type: 'movie' | 'tv_show'
}

interface ContentGridProps {
  items: ContentItem[]
}

export default function ContentGrid({ items }: ContentGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">No Content Found</h2>
        <p className="text-muted-foreground">
          No content matches your current filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <ContentGridCard key={item.id} item={item} />
      ))}
    </div>
  )
}

interface ContentGridCardProps {
  item: ContentItem
}

function ContentGridCard({ item }: ContentGridCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const imageUrl = !imageError && (item.posterUrl || item.backdropUrl) 
    ? (item.posterUrl || item.backdropUrl)
    : 'https://images.unsplash.com/photo-1489599511986-c2e0e5b8b5c2?w=300&h=450&fit=crop'

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/watch/${item.id}`}>
        <div className="relative overflow-hidden rounded-md bg-muted aspect-[2/3]">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/70 flex flex-col items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <Button size="sm" className="mb-2 bg-white text-black hover:bg-gray-200">
              <Play className="w-4 h-4 mr-1" />
              Play
            </Button>
            <Button size="sm" variant="secondary" className="bg-gray-600/70 hover:bg-gray-600/90 text-white">
              <Plus className="w-4 h-4 mr-1" />
              My List
            </Button>
          </div>

          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <span className="bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
              {item.type === 'movie' ? 'Movie' : 'TV Show'}
            </span>
          </div>

          {/* Rating Badge */}
          {item.rating && (
            <div className="absolute top-2 right-2">
              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {item.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Content Info */}
      <div className="mt-2 space-y-1">
        <h3 className="font-medium text-sm line-clamp-2 leading-tight">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.year && <span>{item.year}</span>}
          {item.genre && (
            <>
              {item.year && <span>•</span>}
              <span className="capitalize">{item.genre}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}