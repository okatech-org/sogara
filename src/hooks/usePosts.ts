import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsAPI } from '@/services/api.service'
import { useToast } from '@/hooks/use-toast'

export const usePosts = (filters?: {
  category?: string
  status?: string
  authorId?: string
}) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch des posts
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['posts', filters],
    queryFn: () => postsAPI.getAll(filters).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: []
  })

  // Mutation pour créer un post
  const createMutation = useMutation({
    mutationFn: (postData: any) => postsAPI.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Post créé',
        description: 'Le post a été créé avec succès'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour mettre à jour un post
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => postsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Post mis à jour',
        description: 'Le post a été mis à jour avec succès'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour publier un post
  const publishMutation = useMutation({
    mutationFn: (id: string) => postsAPI.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Post publié',
        description: 'Le post a été publié avec succès'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour dépublier un post
  const unpublishMutation = useMutation({
    mutationFn: (id: string) => postsAPI.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Post dépublié',
        description: 'Le post a été dépublié avec succès'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour supprimer un post
  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Post supprimé',
        description: 'Le post a été supprimé avec succès'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour ajouter un commentaire
  const addCommentMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => 
      postsAPI.addComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Commentaire ajouté',
        description: 'Votre commentaire a été ajouté'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour supprimer un commentaire
  const deleteCommentMutation = useMutation({
    mutationFn: ({ id, commentId }: { id: string; commentId: string }) => 
      postsAPI.deleteComment(id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Commentaire supprimé',
        description: 'Le commentaire a été supprimé'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour liker un post
  const likeMutation = useMutation({
    mutationFn: (id: string) => postsAPI.like(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Mutation pour unliker un post
  const unlikeMutation = useMutation({
    mutationFn: (id: string) => postsAPI.unlike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  return {
    posts,
    isLoading,
    error,
    createPost: createMutation.mutate,
    isCreating: createMutation.isPending,
    updatePost: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    publishPost: publishMutation.mutate,
    isPublishing: publishMutation.isPending,
    unpublishPost: unpublishMutation.mutate,
    isUnpublishing: unpublishMutation.isPending,
    deletePost: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutate,
    isDeletingComment: deleteCommentMutation.isPending,
    likePost: likeMutation.mutate,
    isLiking: likeMutation.isPending,
    unlikePost: unlikeMutation.mutate,
    isUnliking: unlikeMutation.isPending
  }
}

export const usePostsByCategory = (category: string) => {
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['posts', 'by-category', category],
    queryFn: () => postsAPI.getByCategory(category).then(res => res.data),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    placeholderData: []
  })

  return { posts, isLoading, error }
}

export const useTrendingPosts = () => {
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['posts', 'trending'],
    queryFn: () => postsAPI.getTrending().then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    placeholderData: []
  })

  return { posts, isLoading, error }
}

export const usePostStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['posts', 'stats'],
    queryFn: () => postsAPI.getStats().then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: {
      totalPosts: 0,
      publishedPosts: 0,
      totalComments: 0,
      totalLikes: 0,
      byStatus: []
    }
  })

  return { stats, isLoading, error }
}