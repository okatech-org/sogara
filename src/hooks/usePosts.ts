import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Post } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Id } from "../../convex/_generated/dataModel";
import { repositories } from '@/services/repositories';

export function usePosts() {
  // Queries Convex
  const postsData = useQuery(api.posts.list);

  // Fallback local si Convex indisponible
  const [fallbackPosts, setFallbackPosts] = useState<Post[] | null>(null);
  const [fallbackReady, setFallbackReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (postsData === undefined && !fallbackReady) {
      const list = repositories.posts.getAll();
      if (!cancelled) {
        setFallbackPosts(list);
        setFallbackReady(true);
      }
    }
    return () => { cancelled = true; };
  }, [postsData, fallbackReady]);

  // Mutations Convex
  const createMutation = useMutation(api.posts.create);
  const updateMutation = useMutation(api.posts.update);
  const publishMutation = useMutation(api.posts.publish);
  const incrementViewsMutation = useMutation(api.posts.incrementViews);
  const incrementLikesMutation = useMutation(api.posts.incrementLikes);
  const removeMutation = useMutation(api.posts.remove);

  // Mapper les données (Convex si dispo, sinon fallback locales)
  const posts: Post[] = useMemo(() => ((postsData || fallbackPosts || []).map((p: any) => ({
    id: p._id,
    title: p.title,
    content: p.content,
    excerpt: p.excerpt,
    authorId: p.authorId,
    category: p.category,
    status: p.status,
    featuredImage: p.featuredImage,
    images: p.images,
    videoUrl: p.videoUrl,
    tags: p.tags,
    publishedAt: p.publishedAt ? new Date(p.publishedAt) : undefined,
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(p._creationTime),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(p._creationTime),
  }))), [postsData, fallbackPosts]);

  const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createMutation({
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        authorId: postData.authorId as Id<"employees">,
        category: postData.category,
        status: postData.status,
        featuredImage: postData.featuredImage,
        images: postData.images,
        videoUrl: postData.videoUrl,
        tags: postData.tags,
      });

      toast({
        title: 'Article créé',
        description: postData.status === 'published' ? 'L\'article a été publié.' : 'L\'article a été enregistré en brouillon.',
      });

      return { success: true };
    } catch (error: any) {
      try {
        const created = repositories.posts.create({
          ...postData,
          status: postData.status,
        } as any);
        setFallbackPosts((prev) => prev ? [created, ...prev] : [created]);
        toast({ title: 'Article créé (local)', description: 'Mode hors-ligne, enregistré localement.' });
        return { success: true, offline: true } as any;
      } catch (e: any) {
        toast({ title: 'Erreur', description: e?.message || 'Impossible de créer l\'article.', variant: 'destructive' });
        return { success: false, error: e?.message };
      }
    }
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      await updateMutation({
        id: id as Id<"posts">,
        title: updates.title,
        content: updates.content,
        excerpt: updates.excerpt,
        category: updates.category,
        status: updates.status,
        featuredImage: updates.featuredImage,
        images: updates.images,
        videoUrl: updates.videoUrl,
        tags: updates.tags,
      });

      toast({
        title: 'Article mis à jour',
        description: 'Les modifications ont été sauvegardées.',
      });

      return { success: true };
    } catch (error: any) {
      try {
        // Fallback mise à jour locale
        const existing = (fallbackPosts || []).find(p => p.id === id);
        if (existing) {
          const updated: Post = { ...existing, ...updates, updatedAt: new Date() } as Post;
          setFallbackPosts((prev) => prev ? prev.map(p => p.id === id ? updated : p) : [updated]);
          toast({ title: 'Article mis à jour (local)', description: 'Modifications sauvegardées localement.' });
          return { success: true, offline: true } as any;
        }
        return { success: false };
      } catch (e: any) {
        toast({ title: 'Erreur', description: e?.message || 'Impossible de mettre à jour l\'article.', variant: 'destructive' });
        return { success: false, error: e?.message };
      }
    }
  };

  const publishPost = async (id: string) => {
    try {
      await publishMutation({ id: id as Id<"posts"> });

      toast({
        title: 'Article publié',
        description: 'L\'article est maintenant visible par tous.',
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de publier l\'article.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  const deletePost = async (id: string) => {
    try {
      await removeMutation({ id: id as Id<"posts"> });

      toast({
        title: 'Article supprimé',
        description: 'L\'article a été supprimé.',
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'article.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  const incrementViews = async (id: string) => {
    try {
      await incrementViewsMutation({ id: id as Id<"posts"> });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const incrementLikes = async (id: string) => {
    try {
      await incrementLikesMutation({ id: id as Id<"posts"> });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const getPublishedPosts = () => {
    return posts.filter(p => p.status === 'published');
  };

  const getPostsByCategory = (category: Post['category']) => {
    return posts.filter(p => p.category === category);
  };

  const getPostById = (id: string) => {
    return posts.find(p => p.id === id);
  };

  return {
    posts,
    isLoading: postsData === undefined && !fallbackReady,
    createPost,
    updatePost,
    publishPost,
    deletePost,
    incrementViews,
    incrementLikes,
    getPublishedPosts,
    getPostsByCategory,
    getPostById,
  };
}
