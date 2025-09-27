import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { repositories } from '@/services/repositories';
import { Post, PostComment } from '@/types';
import { toast } from '@/hooks/use-toast';
import { convex, convexClientAvailable } from '@/lib/convexClient';

export function usePosts() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (convexClientAvailable) {
          const res = await convex.query('posts:list', {});
          if (!cancelled && Array.isArray(res)) {
            const mapped = res.map((p: any) => ({
              id: String(p._id ?? p.id),
              title: p.title,
              content: p.content,
              excerpt: p.excerpt,
              authorId: String(p.authorId),
              category: p.category,
              status: p.status,
              featuredImage: p.featuredImage,
              images: p.images,
              tags: p.tags,
              publishedAt: p.publishedAt ? new Date(p.publishedAt) : undefined,
              createdAt: new Date(p.createdAt ?? Date.now()),
              updatedAt: new Date(p.updatedAt ?? Date.now()),
            })) as Post[];
            dispatch({ type: 'SET_POSTS', payload: mapped });
            return;
          }
        }
      } catch (_) {}
      const local = repositories.posts.getAll();
      if (!cancelled) dispatch({ type: 'SET_POSTS', payload: local });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (convexClientAvailable) {
        const created = await convex.mutation('posts:create', postData);
        if (created) {
          const mapped: Post = {
            id: String(created._id ?? created.id),
            title: created.title,
            content: created.content,
            excerpt: created.excerpt,
            authorId: String(created.authorId),
            category: created.category,
            status: created.status,
            featuredImage: created.featuredImage,
            images: created.images,
            tags: created.tags,
            publishedAt: created.publishedAt ? new Date(created.publishedAt) : undefined,
            createdAt: new Date(created.createdAt ?? Date.now()),
            updatedAt: new Date(created.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'ADD_POST', payload: mapped });
          toast({ title: 'Publication créée', description: `La publication "${mapped.title}" a été créée avec succès.` });
          return mapped;
        }
      }
      const newPost = repositories.posts.create(postData);
      dispatch({ type: 'ADD_POST', payload: newPost });
      toast({ title: 'Publication créée', description: `La publication "${newPost.title}" a été créée avec succès.` });
      return newPost;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer la publication.', variant: 'destructive' });
      throw error;
    }
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      if (convexClientAvailable) {
        const updated = await convex.mutation('posts:update', { id, updates });
        if (updated) {
          const mapped: Post = {
            id: String(updated._id ?? updated.id),
            title: updated.title,
            content: updated.content,
            excerpt: updated.excerpt,
            authorId: String(updated.authorId),
            category: updated.category,
            status: updated.status,
            featuredImage: updated.featuredImage,
            images: updated.images,
            tags: updated.tags,
            publishedAt: updated.publishedAt ? new Date(updated.publishedAt) : undefined,
            createdAt: new Date(updated.createdAt ?? Date.now()),
            updatedAt: new Date(updated.updatedAt ?? Date.now()),
          };
          dispatch({ type: 'UPDATE_POST', payload: mapped });
          toast({ title: 'Publication mise à jour', description: 'Les modifications ont été sauvegardées.' });
          return mapped;
        }
      }
      const updatedPost = repositories.posts.update(id, updates);
      if (updatedPost) {
        dispatch({ type: 'UPDATE_POST', payload: updatedPost });
        toast({ title: 'Publication mise à jour', description: 'Les modifications ont été sauvegardées.' });
      }
      return updatedPost;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour la publication.', variant: 'destructive' });
      throw error;
    }
  };

  const deletePost = async (id: string) => {
    try {
      let success = false;
      if (convexClientAvailable) {
        const res = await convex.mutation('posts:delete', { id });
        success = !!(res ?? true);
      }
      if (!convexClientAvailable) {
        success = repositories.posts.delete(id);
      }
      if (success) {
        dispatch({ type: 'DELETE_POST', payload: id });
        toast({ title: 'Publication supprimée', description: 'La publication a été supprimée avec succès.' });
      }
      return success;
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer la publication.', variant: 'destructive' });
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