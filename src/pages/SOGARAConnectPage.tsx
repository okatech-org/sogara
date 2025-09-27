import { useState } from 'react';
import { Newspaper, Calendar, Megaphone, Video, Image, Plus, Heart, MessageCircle, Share2, Eye, Filter, Search, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AppContext';
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { PostEditor } from '@/components/PostEditor';
import { VideoPlayer } from '@/components/VideoPlayer';

export function SOGARAConnectPage() {
  const { hasAnyRole, currentUser } = useAuth();
  const { posts, createPost, updatePost } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Post['category']>('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const canManagePosts = hasAnyRole(['ADMIN', 'COMMUNICATION']);

  const filteredPosts = posts.filter(post => {
    if (post.status !== 'published' && !canManagePosts) return false;
    
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const publishedPosts = filteredPosts.filter(p => p.status === 'published');

  const categoryIcons = {
    news: Newspaper,
    activity: Calendar,
    announcement: Megaphone,
    event: Calendar,
  };

  const categoryColors = {
    news: 'bg-primary',
    activity: 'bg-success',
    announcement: 'bg-warning',
    event: 'bg-secondary',
  };

  const categoryLabels = {
    news: 'Actualités',
    activity: 'Activités',
    announcement: 'Annonces',
    event: 'Événements',
  };

  const getAuthorName = (authorId: string) => {
    // Dans un vrai cas, on récupérerait depuis les employés
    return 'Service Communication';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    totalPosts: publishedPosts.length,
    thisWeek: publishedPosts.filter(p => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return p.publishedAt && p.publishedAt >= weekAgo;
    }).length,
    categories: {
      news: publishedPosts.filter(p => p.category === 'news').length,
      activities: publishedPosts.filter(p => p.category === 'activity').length,
      announcements: publishedPosts.filter(p => p.category === 'announcement').length,
      events: publishedPosts.filter(p => p.category === 'event').length,
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleSavePost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingPost) {
        await updatePost(editingPost.id, postData);
      } else {
        await createPost(postData);
      }
      setShowEditor(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingPost(null);
  };

  // Si on est en mode édition, afficher l'éditeur
  if (showEditor) {
    return (
      <PostEditor 
        post={editingPost || undefined}
        onSave={handleSavePost}
        onCancel={handleCancelEdit}
        isEditing={!!editingPost}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            SOGARA Connect
          </h1>
          <p className="text-muted-foreground">
            Actualités, activités et vie de l'entreprise
          </p>
        </div>
        {canManagePosts && (
          <Button className="gap-2 gradient-primary" onClick={handleCreatePost}>
            <Plus className="w-4 h-4" />
            Nouveau poste
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="industrial-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Newspaper className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalPosts}</p>
              <p className="text-xs text-muted-foreground">Publications</p>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.thisWeek}</p>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Megaphone className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categories.announcements}</p>
              <p className="text-xs text-muted-foreground">Annonces</p>
            </div>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categories.events}</p>
              <p className="text-xs text-muted-foreground">Événements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher des publications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'news', 'activity', 'announcement', 'event'] as const).map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(category)}
            >
              {category === 'all' ? 'Tous' : categoryLabels[category as Post['category']]}
            </Button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {publishedPosts.map((post) => {
              const CategoryIcon = categoryIcons[post.category];
              
              return (
                <Card key={post.id} className="industrial-card hover:shadow-[var(--shadow-elevated)] transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${categoryColors[post.category]} rounded-lg flex items-center justify-center`}>
                          <CategoryIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {categoryLabels[post.category]}
                          </Badge>
                          <h3 className="text-lg font-semibold text-foreground leading-tight">
                            {post.title}
                          </h3>
                        </div>
                      </div>
                      {canManagePosts && (
                        <div className="flex gap-2">
                          <StatusBadge 
                            status={post.status === 'published' ? 'Publié' : post.status === 'draft' ? 'Brouillon' : 'Archivé'}
                            variant={post.status === 'published' ? 'success' : 'warning'}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPost(post);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {post.featuredImage && (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <img 
                          src={post.featuredImage} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        {post.videoUrl && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center">
                              <Video className="w-8 h-8 text-white ml-1" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {post.videoUrl && !post.featuredImage && (
                      <VideoPlayer url={post.videoUrl} title={post.title} />
                    )}
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Par {getAuthorName(post.authorId)}</span>
                        <span>•</span>
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Heart className="w-4 h-4" />
                          <span className="text-xs">12</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">5</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {publishedPosts.length === 0 && (
            <Card className="industrial-card">
              <CardContent className="text-center py-12">
                <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucune publication trouvée</h3>
                <p className="text-muted-foreground">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Essayez de modifier vos filtres de recherche'
                    : 'Les actualités de SOGARA apparaîtront ici'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="text-lg">Catégories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const count = stats.categories[key as keyof typeof stats.categories];
                const Icon = categoryIcons[key as Post['category']];
                
                return (
                  <div key={key} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 ${categoryColors[key as Post['category']]} rounded flex items-center justify-center`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="text-lg">À la une</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {publishedPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2 mb-1">
                      {post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}