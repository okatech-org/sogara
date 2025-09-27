import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaUpload } from './MediaUpload';
import { Post } from '@/types';
import { X, Save, Eye, Send } from 'lucide-react';

interface PostEditorProps {
  post?: Post;
  onSave: (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function PostEditor({ post, onSave, onCancel, isEditing = false }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [category, setCategory] = useState<Post['category']>(post?.category || 'news');
  const [status, setStatus] = useState<Post['status']>(post?.status || 'draft');
  const [images, setImages] = useState<string[]>(post?.images || []);
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || '');
  const [videoUrl, setVideoUrl] = useState(post?.videoUrl || '');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-générer l'extrait à partir du contenu
  useEffect(() => {
    if (content && !excerpt) {
      const autoExcerpt = content
        .replace(/[#*`]/g, '')
        .substring(0, 150)
        .trim();
      
      if (autoExcerpt.length >= 140) {
        setExcerpt(autoExcerpt + '...');
      } else {
        setExcerpt(autoExcerpt);
      }
    }
  }, [content, excerpt]);

  // Définir l'image principale automatiquement
  useEffect(() => {
    if (images.length > 0 && !featuredImage) {
      setFeaturedImage(images[0]);
    }
  }, [images, featuredImage]);

  const categoryLabels = {
    news: 'Actualités',
    activity: 'Activités',
    announcement: 'Annonces',
    event: 'Événements',
  };

  const statusLabels = {
    draft: 'Brouillon',
    published: 'Publié',
    archived: 'Archivé',
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
    // Mettre à jour l'image principale si nécessaire
    if (newImages.length > 0 && !featuredImage) {
      setFeaturedImage(newImages[0]);
    } else if (newImages.length === 0) {
      setFeaturedImage('');
    }
  };

  const handleSubmit = async (publishNow = false) => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 150).trim() + '...',
        authorId: '6', // ID du responsable communication
        category,
        status: publishNow ? 'published' : status,
        featuredImage: featuredImage || (images.length > 0 ? images[0] : undefined),
        images: images.length > 0 ? images : undefined,
        videoUrl: videoUrl.trim() || undefined,
        tags,
        publishedAt: publishNow ? new Date() : (status === 'published' ? new Date() : undefined),
      };

      await onSave(postData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim() && content.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{isEditing ? 'Modifier la publication' : 'Nouvelle publication'}</span>
            <Button variant="ghost" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Titre */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium mb-2 block">
              Titre *
            </Label>
            <Input
              id="title"
              placeholder="Saisissez le titre de votre publication..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Catégorie et Statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Catégorie</Label>
              <Select value={category} onValueChange={(value: Post['category']) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Statut</Label>
              <Select value={status} onValueChange={(value: Post['status']) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contenu */}
          <div>
            <Label htmlFor="content" className="text-sm font-medium mb-2 block">
              Contenu *
            </Label>
            <Textarea
              id="content"
              placeholder="Rédigez le contenu de votre publication..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          {/* Extrait */}
          <div>
            <Label htmlFor="excerpt" className="text-sm font-medium mb-2 block">
              Extrait (résumé)
            </Label>
            <Textarea
              id="excerpt"
              placeholder="Résumé court qui apparaîtra dans la liste des publications..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={200}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {excerpt.length}/200 caractères
            </p>
          </div>

          {/* Médias */}
          <div>
            <h3 className="text-sm font-medium mb-3">Médias</h3>
            <MediaUpload
              onImagesChange={handleImagesChange}
              onVideoChange={setVideoUrl}
              existingImages={images}
              existingVideo={videoUrl}
              maxImages={5}
            />
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Tags
            </Label>
            
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ajouter un tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Ajouter
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTag(tag)}
                      className="w-4 h-4 p-0 hover:bg-transparent"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={!isFormValid || isSubmitting}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </Button>
              
              <Button
                onClick={() => handleSubmit(true)}
                disabled={!isFormValid || isSubmitting}
                className="gap-2 gradient-primary"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Publication...' : 'Publier maintenant'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}