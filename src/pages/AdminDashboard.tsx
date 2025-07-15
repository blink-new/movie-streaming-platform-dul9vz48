import { useState, useEffect } from 'react'
import { createClient } from '@blinkdotnew/sdk'
import { Plus, Edit, Trash2, Film, Tv, Users, BarChart3, Upload } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { toast } from 'sonner'
import Navigation from '../components/Navigation'

const blink = createClient({
  projectId: 'movie-streaming-platform-dul9vz48',
  authRequired: true
})

interface AdminDashboardProps {
  user: any
}

interface ContentItem {
  id: string
  title: string
  description?: string
  posterUrl?: string
  backdropUrl?: string
  videoUrl?: string
  year?: number
  genre?: string
  rating?: number
  duration?: number
  createdAt: string
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [movies, setMovies] = useState<ContentItem[]>([])
  const [tvShows, setTvShows] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    videoUrl: '',
    year: new Date().getFullYear(),
    genre: '',
    rating: 0,
    duration: 0,
    type: 'movie' as 'movie' | 'tv_show'
  })

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const [moviesData, tvShowsData] = await Promise.all([
        blink.db.movies.list({ orderBy: { createdAt: 'desc' } }),
        blink.db.tvShows.list({ orderBy: { createdAt: 'desc' } })
      ])
      setMovies(moviesData)
      setTvShows(tvShowsData)
    } catch (error) {
      console.error('Error loading content:', error)
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    try {
      const contentData = {
        id: editingItem?.id || `${formData.type}_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        posterUrl: formData.posterUrl,
        backdropUrl: formData.backdropUrl,
        videoUrl: formData.videoUrl,
        year: formData.year,
        genre: formData.genre,
        rating: formData.rating,
        duration: formData.duration,
        userId: user.id,
        createdAt: editingItem?.createdAt || new Date().toISOString()
      }

      if (editingItem) {
        // Update existing content
        if (formData.type === 'movie') {
          await blink.db.movies.update(editingItem.id, contentData)
        } else {
          await blink.db.tvShows.update(editingItem.id, contentData)
        }
        toast.success(`${formData.type === 'movie' ? 'Movie' : 'TV Show'} updated successfully`)
      } else {
        // Create new content
        if (formData.type === 'movie') {
          await blink.db.movies.create(contentData)
        } else {
          await blink.db.tvShows.create(contentData)
        }
        toast.success(`${formData.type === 'movie' ? 'Movie' : 'TV Show'} added successfully`)
      }

      // Reset form and reload content
      resetForm()
      setIsAddDialogOpen(false)
      setEditingItem(null)
      loadContent()
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save content')
    }
  }

  const handleDelete = async (id: string, type: 'movie' | 'tv_show') => {
    if (!confirm(`Are you sure you want to delete this ${type === 'movie' ? 'movie' : 'TV show'}?`)) {
      return
    }

    try {
      if (type === 'movie') {
        await blink.db.movies.delete(id)
      } else {
        await blink.db.tvShows.delete(id)
      }
      toast.success(`${type === 'movie' ? 'Movie' : 'TV Show'} deleted successfully`)
      loadContent()
    } catch (error) {
      console.error('Error deleting content:', error)
      toast.error('Failed to delete content')
    }
  }

  const handleEdit = (item: ContentItem, type: 'movie' | 'tv_show') => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      posterUrl: item.posterUrl || '',
      backdropUrl: item.backdropUrl || '',
      videoUrl: item.videoUrl || '',
      year: item.year || new Date().getFullYear(),
      genre: item.genre || '',
      rating: item.rating || 0,
      duration: item.duration || 0,
      type
    })
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      posterUrl: '',
      backdropUrl: '',
      videoUrl: '',
      year: new Date().getFullYear(),
      genre: '',
      rating: 0,
      duration: 0,
      type: 'movie'
    })
  }

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Thriller', 
    'Sci-Fi', 'Fantasy', 'Romance', 'Documentary', 'Animation', 'Crime'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your streaming platform content</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="tv-shows">TV Shows</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
                    <Film className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{movies.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Available in library
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total TV Shows</CardTitle>
                    <Tv className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tvShows.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Available in library
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{movies.length + tvShows.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Movies and TV shows combined
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { resetForm(); setEditingItem(null) }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? 'Edit Content' : 'Add New Content'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingItem ? 'Update the content details below.' : 'Fill in the details to add new content to your platform.'}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Content Type</Label>
                            <Select value={formData.type} onValueChange={(value: 'movie' | 'tv_show') => setFormData({ ...formData, type: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="movie">Movie</SelectItem>
                                <SelectItem value="tv_show">TV Show</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="year">Year</Label>
                            <Input
                              id="year"
                              type="number"
                              value={formData.year}
                              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                              min="1900"
                              max={new Date().getFullYear() + 5}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="genre">Genre</Label>
                            <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select genre" />
                              </SelectTrigger>
                              <SelectContent>
                                {genres.map((genre) => (
                                  <SelectItem key={genre} value={genre.toLowerCase()}>
                                    {genre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rating">Rating (0-10)</Label>
                            <Input
                              id="rating"
                              type="number"
                              value={formData.rating}
                              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                              min="0"
                              max="10"
                              step="0.1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={formData.duration}
                              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                              min="0"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="posterUrl">Poster Image URL</Label>
                          <Input
                            id="posterUrl"
                            type="url"
                            value={formData.posterUrl}
                            onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                            placeholder="https://example.com/poster.jpg"
                          />
                        </div>

                        <div>
                          <Label htmlFor="backdropUrl">Backdrop Image URL</Label>
                          <Input
                            id="backdropUrl"
                            type="url"
                            value={formData.backdropUrl}
                            onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
                            placeholder="https://example.com/backdrop.jpg"
                          />
                        </div>

                        <div>
                          <Label htmlFor="videoUrl">Video URL</Label>
                          <Input
                            id="videoUrl"
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingItem ? 'Update' : 'Add'} Content
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movies" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Movies ({movies.length})</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetForm(); setFormData({ ...formData, type: 'movie' }); setEditingItem(null) }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Movie
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              <ContentTable 
                items={movies} 
                type="movie" 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </TabsContent>

            <TabsContent value="tv-shows" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">TV Shows ({tvShows.length})</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetForm(); setFormData({ ...formData, type: 'tv_show' }); setEditingItem(null) }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add TV Show
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              <ContentTable 
                items={tvShows} 
                type="tv_show" 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

interface ContentTableProps {
  items: ContentItem[]
  type: 'movie' | 'tv_show'
  onEdit: (item: ContentItem, type: 'movie' | 'tv_show') => void
  onDelete: (id: string, type: 'movie' | 'tv_show') => void
}

function ContentTable({ items, type, onEdit, onDelete }: ContentTableProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              {type === 'movie' ? <Film className="w-6 h-6" /> : <Tv className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No {type === 'movie' ? 'Movies' : 'TV Shows'} Yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start building your library by adding your first {type === 'movie' ? 'movie' : 'TV show'}.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.posterUrl || 'https://images.unsplash.com/photo-1489599511986-c2e0e5b8b5c2?w=60&h=90&fit=crop'}
                      alt={item.title}
                      className="w-10 h-15 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {item.description || 'No description'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.year || 'N/A'}</TableCell>
                <TableCell>
                  {item.genre ? (
                    <Badge variant="secondary" className="capitalize">
                      {item.genre}
                    </Badge>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {item.rating ? `★ ${item.rating.toFixed(1)}` : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={item.videoUrl ? 'default' : 'secondary'}>
                    {item.videoUrl ? 'Available' : 'No Video'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item, type)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id, type)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}