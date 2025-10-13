import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// CREATE Post
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    authorId: v.id('employees'),
    category: v.string(), // "news" | "activity" | "announcement" | "event"
    status: v.string(), // "draft" | "published" | "archived"
    featuredImage: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    videoUrl: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert('posts', {
      title: args.title,
      content: args.content,
      excerpt: args.excerpt,
      authorId: args.authorId,
      category: args.category,
      status: args.status,
      featuredImage: args.featuredImage,
      images: args.images,
      videoUrl: args.videoUrl,
      tags: args.tags,
      publishedAt: args.status === 'published' ? Date.now() : undefined,
      views: 0,
      likes: 0,
    })

    return postId
  },
})

// LIST all posts
export const list = query({
  args: {},
  handler: async ctx => {
    const posts = await ctx.db.query('posts').order('desc').collect()

    // Enrichir avec les données de l'auteur
    const enrichedPosts = await Promise.all(
      posts.map(async post => {
        const author = await ctx.db.get(post.authorId)
        return {
          ...post,
          author,
        }
      }),
    )

    return enrichedPosts
  },
})

// LIST posts by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('posts')
      .withIndex('by_status', q => q.eq('status', args.status))
      .order('desc')
      .collect()

    const enrichedPosts = await Promise.all(
      posts.map(async post => {
        const author = await ctx.db.get(post.authorId)
        return {
          ...post,
          author,
        }
      }),
    )

    return enrichedPosts
  },
})

// LIST posts by category
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('posts')
      .withIndex('by_category', q => q.eq('category', args.category))
      .order('desc')
      .collect()

    const enrichedPosts = await Promise.all(
      posts.map(async post => {
        const author = await ctx.db.get(post.authorId)
        return {
          ...post,
          author,
        }
      }),
    )

    return enrichedPosts
  },
})

// LIST published posts
export const listPublished = query({
  args: {},
  handler: async ctx => {
    const posts = await ctx.db
      .query('posts')
      .withIndex('by_status', q => q.eq('status', 'published'))
      .order('desc')
      .collect()

    const enrichedPosts = await Promise.all(
      posts.map(async post => {
        const author = await ctx.db.get(post.authorId)
        return {
          ...post,
          author,
        }
      }),
    )

    return enrichedPosts
  },
})

// GET post by ID
export const getById = query({
  args: { id: v.id('posts') },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id)
    if (!post) return null

    const author = await ctx.db.get(post.authorId)

    return {
      ...post,
      author,
    }
  },
})

// UPDATE post
export const update = mutation({
  args: {
    id: v.id('posts'),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    videoUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    const updateData: any = {}
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updateData[key] = value
      }
    }

    // Si on publie, ajouter publishedAt
    if (updates.status === 'published') {
      const post = await ctx.db.get(id)
      if (post && !post.publishedAt) {
        updateData.publishedAt = Date.now()
      }
    }

    await ctx.db.patch(id, updateData)
  },
})

// PUBLISH post
export const publish = mutation({
  args: { id: v.id('posts') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'published',
      publishedAt: Date.now(),
    })
  },
})

// INCREMENT views
export const incrementViews = mutation({
  args: { id: v.id('posts') },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id)
    if (!post) return

    await ctx.db.patch(args.id, {
      views: post.views + 1,
    })
  },
})

// INCREMENT likes
export const incrementLikes = mutation({
  args: { id: v.id('posts') },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id)
    if (!post) return

    await ctx.db.patch(args.id, {
      likes: post.likes + 1,
    })
  },
})

// DELETE post
export const remove = mutation({
  args: { id: v.id('posts') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
