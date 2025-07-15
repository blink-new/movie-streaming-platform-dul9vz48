import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play, Plus } from 'lucide-react'
import { Button } from './ui/button'

interface ContentItem {
  id: string
  title: string
  posterUrl?: string
  backdropUrl?: string
  description?: string
  year?: number
  rating?: number
}

interface ContentCarouselProps {
  title: string
  items: ContentItem[]
  type: 'movie' | 'tv_show'
}

export default function ContentCarousel({ title, items, type }: ContentCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    
    const scrollAmount = 400
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount
    
    scrollRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
    setScrollPosition(newPosition)
  }

  if (items.length === 0) return null

  return (
    <div className="relative group">
      <h2 className="text-xl lg:text-2xl font-semibold mb-4 px-4 lg:px-0">
        {title}
      </h2>
      
      <div className="relative">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
          disabled={scrollPosition === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        {/* Content Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 lg:px-0"
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {items.map((item) => (
            <ContentCard key={item.id} item={item} type={type} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ContentCardProps {
  item: ContentItem
  type: 'movie' | 'tv_show'
}

function ContentCard({ item, type }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const imageUrl = item.posterUrl || item.backdropUrl || 'https://images.unsplash.com/photo-1489599511986-c2e0e5b8b5c2?w=300&h=450&fit=crop'

  return (
    <div
      className="relative flex-shrink-0 w-48 lg:w-56 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/watch/${item.id}`}>
        <div className="relative overflow-hidden rounded-md bg-muted">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-72 lg:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="text-center">
              <Button size="sm" className="mb-2">
                <Play className="w-4 h-4 mr-1" />
                Play
              </Button>
              <Button size="sm" variant="secondary">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Content Info */}
      <div className="mt-2 px-1">
        <h3 className="font-medium text-sm lg:text-base line-clamp-1">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {item.year && <span>{item.year}</span>}
          {item.rating && (
            <>
              <span>•</span>
              <span>★ {item.rating.toFixed(1)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}