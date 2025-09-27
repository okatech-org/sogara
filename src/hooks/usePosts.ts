import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { Post, PostComment } from '@/types';
import { toast } from '@/hooks/use-toast';

export function usePosts() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const posts = repositories.posts.getAll();
    dispatch({ type: 'SET_POSTS', payload: posts });
  }, [dispatch]);

  const createPost = (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPost = repositories.posts.create(postData);
      dispatch({ type: 'ADD_POST', payload: newPost });
      
      toast({
        title: 'Publication créée',
        description: `La publication "${newPost.title}" a été créée avec succès.`,
      });
      return newPost;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la publication.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    try {
      const updatedPost = repositories.posts.update(id, updates);
      if (updatedPost) {
        dispatch({ type: 'UPDATE_POST', payload: updatedPost });
        toast({
          title: 'Publication mise à jour',
          description: 'Les modifications ont été sauvegardées.',
        });
        return updatedPost;
      }
      return null;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la publication.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deletePost = (id: string) => {
    try {
      const success = repositories.posts.delete(id);
      if (success) {
        dispatch({ type: 'DELETE_POST', payload: id });
        toast({
          title: 'Publication supprimée',
          description: 'La publication a été supprimée avec succès.',
        });
      }
      return success;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la publication.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const publishPost = (id: string) => {
    return updatePost(id, { 
      status: 'published',
      publishedAt: new Date()
    });
  };

  const archivePost = (id: string) => {
    return updatePost(id, { status: 'archived' });
  };

  const getPostsByCategory = (category: Post['category']) => {
    return state.posts.filter(post => post.category === category);
  };

  const getPublishedPosts = () => {
    return state.posts.filter(post => post.status === 'published');
  };

  return {
    posts: state.posts || [],
    createPost,
    updatePost,
    deletePost,
    publishPost,
    archivePost,
    getPostsByCategory,
    getPublishedPosts,
  };
}