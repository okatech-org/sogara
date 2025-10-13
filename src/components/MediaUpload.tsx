import { useState, useRef } from 'react'
import { Upload, Image, Video, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

interface MediaUploadProps {
  onImagesChange: (images: string[]) => void
  onVideoChange: (videoUrl: string) => void
  existingImages?: string[]
  existingVideo?: string
  maxImages?: number
}

export function MediaUpload({
  onImagesChange,
  onVideoChange,
  existingImages = [],
  existingVideo = '',
  maxImages = 5,
}: MediaUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [videoUrl, setVideoUrl] = useState(existingVideo)
  const [isUploading, setIsUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    if (images.length + files.length > maxImages) {
      toast({
        title: 'Limite dépassée',
        description: `Vous ne pouvez pas ajouter plus de ${maxImages} images.`,
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)

    try {
      const selected = Array.from(files)

      // Helper pour convertir un fichier en Data URL (persistant dans localStorage)
      const readFileAsDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

      // Valider les fichiers et préparer la lecture
      const validFiles = selected.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Format non supporté',
            description: `Le fichier ${file.name} n'est pas une image valide.`,
            variant: 'destructive',
          })
          return false
        }
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'Fichier trop volumineux',
            description: `${file.name} dépasse la limite de 5MB.`,
            variant: 'destructive',
          })
          return false
        }
        return true
      })

      const uploadedImages: string[] = await Promise.all(
        validFiles.map(file => readFileAsDataUrl(file)),
      )

      if (uploadedImages.length > 0) {
        const newImages = [...images, ...uploadedImages]
        setImages(newImages)
        onImagesChange(newImages)

        toast({
          title: 'Images ajoutées',
          description: `${uploadedImages.length} image(s) ajoutée(s) avec succès.`,
        })
      }
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'ajouter les images.",
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url)
    onVideoChange(url)
  }

  const isValidVideoUrl = (url: string) => {
    if (!url) return true

    // Support pour YouTube, Vimeo, et liens directs
    const videoPatterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
      /^https?:\/\/(www\.)?vimeo\.com\/.+/,
      /^https?:\/\/.+\.(mp4|webm|ogg)$/,
    ]

    return videoPatterns.some(pattern => pattern.test(url))
  }

  return (
    <div className="space-y-6">
      {/* Upload d'images */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Images ({images.length}/{maxImages})
        </Label>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-0">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="w-8 h-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {images.length < maxImages && (
            <Card
              className="border-dashed border-2 cursor-pointer hover:border-primary transition-colors"
              onClick={() => imageInputRef.current?.click()}
            >
              <CardContent className="aspect-video flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-2">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {isUploading ? 'Upload...' : 'Ajouter image'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          disabled={isUploading}
        />

        <p className="text-xs text-muted-foreground">
          Formats supportés: JPG, PNG, GIF, WEBP. Taille max: 5MB par image.
        </p>
      </div>

      {/* URL Vidéo */}
      <div>
        <Label htmlFor="video-url" className="text-sm font-medium mb-3 block">
          Vidéo (optionnel)
        </Label>

        <div className="space-y-3">
          <Input
            id="video-url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=... ou lien direct vers vidéo"
            value={videoUrl}
            onChange={e => handleVideoUrlChange(e.target.value)}
            className={!isValidVideoUrl(videoUrl) ? 'border-destructive' : ''}
          />

          {videoUrl && isValidVideoUrl(videoUrl) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Vidéo ajoutée</p>
                    <p className="text-xs text-muted-foreground truncate">{videoUrl}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVideoUrlChange('')}
                    className="w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {videoUrl && !isValidVideoUrl(videoUrl) && (
            <p className="text-xs text-destructive">
              URL vidéo non valide. Utilisez YouTube, Vimeo ou un lien direct (.mp4, .webm, .ogg).
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Collez l'URL d'une vidéo YouTube, Vimeo ou un lien direct vers un fichier vidéo.
          </p>
        </div>
      </div>
    </div>
  )
}
