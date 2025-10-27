import express from 'express';
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "Harshal";

// Helper to get Prisma client
function getPrisma() {
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_s8PjUA2GLDdw@ep-odd-breeze-adxxl9ap-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  }).$extends(withAccelerate());
}

// Auth middleware
interface AuthRequest extends express.Request {
  userId?: number;
}

const authMiddleware = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization || "";
  try {
    const decoded = jwt.verify(authHeader, JWT_SECRET) as { id: number };
    if (decoded && decoded.id) {
      req.userId = decoded.id;
      next();
    } else {
      res.status(403).json({ message: "You are not logged in" });
    }
  } catch (e) {
    res.status(403).json({ message: "You are not logged in" });
  }
};

// Create Blog
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    const body = req.body;
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
        return res.status(411).json({ message: "Inputs not correct" });
    }

    const authorId = req.userId!;
    const prisma = getPrisma();

    try {
        const blog = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: authorId
            }
        });

        res.json({ id: blog.id });
    } catch (e) {
        res.status(500).json({ message: "Error creating blog" });
    }
});

// Update Blog
router.put('/', authMiddleware, async (req: AuthRequest, res) => {
    const body = req.body;
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        return res.status(411).json({ message: "Inputs not correct" });
    }

    const prisma = getPrisma();

    try {
        const blog = await prisma.blog.update({
            where: { id: body.id },
            data: {
                title: body.title,
                content: body.content
            }
        });

        res.json({ id: blog.id });
    } catch (e) {
        res.status(500).json({ message: "Error updating blog" });
    }
});

// Get All Blogs
router.get('/bulk', authMiddleware, async (req: AuthRequest, res) => {
    const prisma = getPrisma();
    const userId = req.userId!;

    try {
        const blogs = await prisma.blog.findMany({
            select: {
                content: true,
                title: true,
                id: true,
                author: {
                    select: { id: true, name: true }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        // Get user's likes and saved posts for all blogs
        const blogIds = blogs.map(blog => blog.id);
        const [userLikes, userSavedPosts] = await Promise.all([
            prisma.like.findMany({
                where: { userId, blogId: { in: blogIds } },
                select: { blogId: true }
            }),
            prisma.savedPost.findMany({
                where: { userId, blogId: { in: blogIds } },
                select: { blogId: true }
            })
        ]);

        const likedBlogIds = new Set(userLikes.map((like: { blogId: number }) => like.blogId));
        const savedBlogIds = new Set(userSavedPosts.map((saved: { blogId: number }) => saved.blogId));

        const blogsWithUserData = blogs.map(blog => ({
            ...blog,
            liked: likedBlogIds.has(blog.id),
            saved: savedBlogIds.has(blog.id),
            likeCount: blog._count.likes,
            commentCount: blog._count.comments
        }));

        res.json({ blogs: blogsWithUserData });
    } catch (e) {
        res.status(500).json({ message: "Error fetching blogs" });
    }
});

// Get Single Blog
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
    const id = req.params.id;
    const prisma = getPrisma();

    try {
        const blog = await prisma.blog.findFirst({
            where: { id: Number(id) },
            select: {
                id: true,
                title: true,
                content: true,
                author: {
                    select: { id: true, name: true }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Check if current user liked and saved this blog
        const userId = req.userId!;
        const [userLike, userSaved] = await Promise.all([
            prisma.like.findUnique({
                where: { userId_blogId: { userId, blogId: Number(id) } }
            }),
            prisma.savedPost.findUnique({
                where: { userId_blogId: { userId, blogId: Number(id) } }
            })
        ]);

        res.json({ 
            blog: {
                ...blog,
                liked: !!userLike,
                saved: !!userSaved,
                likeCount: blog._count.likes,
                commentCount: blog._count.comments
            }
        });
    } catch (e) {
        res.status(411).json({ message: "Error while fetching blog post" });
    }
});

// Like a blog post
router.post('/:id/like', authMiddleware, async (req: AuthRequest, res) => {
    const blogId = Number(req.params.id);
    const userId = req.userId!;
    
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ message: "Invalid blog id" });
    }

    const prisma = getPrisma();

    try {
        // Check if blog exists
        const blog = await prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Create like (upsert to handle duplicates)
        await prisma.like.upsert({
            where: { userId_blogId: { userId, blogId } },
            update: {},
            create: { userId, blogId }
        });

        // Get updated like count
        const likeCount = await prisma.like.count({ where: { blogId } });
        
        res.json({ liked: true, likeCount });
    } catch (e) {
        res.status(500).json({ message: "Error while liking blog post" });
    }
});

// Unlike a blog post
router.delete('/:id/like', authMiddleware, async (req: AuthRequest, res) => {
    const blogId = Number(req.params.id);
    const userId = req.userId!;
    
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ message: "Invalid blog id" });
    }

    const prisma = getPrisma();

    try {
        await prisma.like.deleteMany({
            where: { userId, blogId }
        });

        // Get updated like count
        const likeCount = await prisma.like.count({ where: { blogId } });
        
        res.json({ liked: false, likeCount });
    } catch (e) {
        res.status(500).json({ message: "Error while unliking blog post" });
    }
});

// Get likes for a blog post
router.get('/:id/likes', authMiddleware, async (req: AuthRequest, res) => {
    const blogId = Number(req.params.id);
    const userId = req.userId!;
    
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ message: "Invalid blog id" });
    }

    const prisma = getPrisma();

    try {
        const likeCount = await prisma.like.count({ where: { blogId } });
        const userLike = await prisma.like.findUnique({
            where: { userId_blogId: { userId, blogId } }
        });
        
        res.json({ 
            likeCount, 
            liked: !!userLike 
        });
    } catch (e) {
        res.status(500).json({ message: "Error while fetching likes" });
    }
});

// Get comments for a blog post
router.get('/:id/comments', authMiddleware, async (req: AuthRequest, res) => {
    const blogId = Number(req.params.id);
    
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ message: "Invalid blog id" });
    }

    const prisma = getPrisma();

    try {
        const comments = await prisma.comment.findMany({
            where: { 
                blogId,
                parentId: null // Only top-level comments
            },
            include: {
                user: { select: { id: true, name: true, username: true } },
                replies: {
                    include: {
                        user: { select: { id: true, name: true, username: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        res.json({ comments });
    } catch (e) {
        res.status(500).json({ message: "Error while fetching comments" });
    }
});

// Create a comment on a blog post
router.post('/:id/comments', authMiddleware, async (req: AuthRequest, res) => {
    const blogId = Number(req.params.id);
    const userId = req.userId!;
    const body = req.body;
    
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ message: "Invalid blog id" });
    }

    if (!body.content || body.content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
    }

    const prisma = getPrisma();

    try {
        // Check if blog exists
        const blog = await prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const comment = await prisma.comment.create({
            data: {
                content: body.content.trim(),
                userId,
                blogId
            },
            include: {
                user: { select: { id: true, name: true, username: true } }
            }
        });
        
        res.json({ comment });
    } catch (e) {
        res.status(500).json({ message: "Error while creating comment" });
    }
});

// Reply to a comment
router.post('/comment/:id/reply', authMiddleware, async (req: AuthRequest, res) => {
    const parentCommentId = Number(req.params.id);
    const userId = req.userId!;
    const body = req.body;
    
    if (!parentCommentId || isNaN(parentCommentId)) {
        return res.status(400).json({ message: "Invalid comment id" });
    }

    if (!body.content || body.content.trim().length === 0) {
        return res.status(400).json({ message: "Reply content is required" });
    }

    const prisma = getPrisma();

    try {
        // Check if parent comment exists
        const parentComment = await prisma.comment.findUnique({ 
            where: { id: parentCommentId },
            select: { id: true, blogId: true }
        });
        
        if (!parentComment) {
            return res.status(404).json({ message: "Parent comment not found" });
        }

        const reply = await prisma.comment.create({
            data: {
                content: body.content.trim(),
                userId,
                blogId: parentComment.blogId,
                parentId: parentCommentId
            },
            include: {
                user: { select: { id: true, name: true, username: true } }
            }
        });
        
        res.json({ reply });
    } catch (e) {
        res.status(500).json({ message: "Error while creating reply" });
    }
});

// Save a blog post
router.post('/:id/save', authMiddleware, async (req: AuthRequest, res) => {
    const blogId = Number(req.params.id);
    const userId = req.userId!;
    
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ message: "Invalid blog id" });
    }

    const prisma = getPrisma();

    try {
        // Check if blog exists
        const blog = await prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Save the post (use upsert to handle duplicates)
        await prisma.$executeRaw`
            INSERT INTO "SavedPost" ("userId", "blogId", "createdAt")
            VALUES (${userId}, ${blogId}, NOW())
            ON CONFLICT ("userId", "blogId") DO NOTHING
        `;
        
        res.json({ saved: true });
    } catch (e) {
        res.status(500).json({ message: "Error while saving blog post" });
    }
});

// Unsave a blog post
router.delete('/:id/save', authMiddleware, async (req: AuthRequest, res) => {
    const blogId = Number(req.params.id);
    const userId = req.userId!;
    
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ message: "Invalid blog id" });
    }

    const prisma = getPrisma();

    try {
        await prisma.$executeRaw`
            DELETE FROM "SavedPost" 
            WHERE "userId" = ${userId} AND "blogId" = ${blogId}
        `;
        
        res.json({ saved: false });
    } catch (e) {
        res.status(500).json({ message: "Error while unsaving blog post" });
    }
});

// Check if blog is saved by user
router.get('/:id/saved', authMiddleware, async (req: AuthRequest, res) => {
    const blogId = Number(req.params.id);
    const userId = req.userId!;
    
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ message: "Invalid blog id" });
    }

    const prisma = getPrisma();

    try {
        const saved = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM "SavedPost" 
            WHERE "userId" = ${userId} AND "blogId" = ${blogId}
        ` as any[];
        
        res.json({ saved: Number(saved[0].count) > 0 });
    } catch (e) {
        res.status(500).json({ message: "Error while checking saved status" });
    }
});

// Delete blog post (only by author)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
    const blogId = Number(req.params.id);
    const userId = req.userId!;
    
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ message: "Invalid blog id" });
    }

    const prisma = getPrisma();

    try {
        // Check if blog exists and user is the author
        const blog = await prisma.blog.findUnique({ 
            where: { id: blogId },
            select: { authorId: true }
        });
        
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if (blog.authorId !== userId) {
            return res.status(403).json({ message: "Access denied - you can only delete your own posts" });
        }

        // Delete the blog (cascade will handle related data)
        await prisma.blog.delete({
            where: { id: blogId }
        });
        
        res.json({ deleted: true });
    } catch (e) {
        res.status(500).json({ message: "Error while deleting blog post" });
    }
});

export { router as blogRouter };