import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoPlayerProps {
  url: string
  title?: string
  className?: string
}

export function VideoPlayer({ url, title, className = '' }: VideoPlayerProps) {
  const [showPlayer, setShowPlayer] = useState(false)

  const getVideoEmbedUrl = (url: string): string | null => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }

    // Direct video link
    if (url.match(/\.(mp4|webm|ogg)$/)) {
      return url
    }

    return null
  }

  const getThumbnailUrl = (url: string): string | null => {
    // YouTube thumbnail
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
    }

    return null
  }

  const getVideoTitle = (url: string): string => {
    if (title) return title

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'Vidéo YouTube'
    }
    if (url.includes('vimeo.com')) {
      return 'Vidéo Vimeo'
    }
    return 'Vidéo'
  }

  const embedUrl = getVideoEmbedUrl(url)
  const thumbnailUrl = getThumbnailUrl(url)

  if (!embedUrl) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-muted/30 rounded-lg border ${className}`}>
        <ExternalLink className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Lien vidéo</p>
          <p className="text-xs text-muted-foreground truncate">{url}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            Ouvrir
          </a>
        </Button>
      </div>
    )
  }

  if (!showPlayer) {
    return (
      <div
        className={`relative aspect-video rounded-lg overflow-hidden bg-black cursor-pointer group ${className}`}
        onClick={() => setShowPlayer(true)}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={getVideoTitle(url)}
            className="w-full h-full object-cover"
            onError={e => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-12 h-12 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium">{getVideoTitle(url)}</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-primary ml-1" />
          </div>
        </div>
      </div>
    )
  }

  // Afficher le lecteur intégré
  if (embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com')) {
    return (
      <div className={`aspect-video rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={embedUrl}
          title={getVideoTitle(url)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  // Lecteur vidéo HTML5 pour les liens directs
  return (
    <div className={`aspect-video rounded-lg overflow-hidden ${className}`}>
      <video src={embedUrl} controls className="w-full h-full" preload="metadata">
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    </div>
  )
}
