import express from 'express';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { signupInput, signinInput } from "../../index";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "Harshal";

// Helper to get Prisma client with better connection handling
function getPrisma() {
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_s8PjUA2GLDdw@ep-odd-breeze-adxxl9ap-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    log: ['error', 'warn'],
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

// Auth helper
async function getUserId(req: AuthRequest): Promise<number | null> {
  const authHeader = req.headers.authorization || "";
  try {
    const decoded = jwt.verify(authHeader, JWT_SECRET) as { id: number };
    return decoded?.id || null;
  } catch {
    return null;
  }
}

// Signup
router.post('/signup', async (req, res) => {
  const body = req.body;
  console.log('Signup request body:', body);
  
  // Custom validation for signup - more flexible
  if (!body.username || !body.password || body.password.length < 6) {
    console.log('Basic validation failed');
    return res.status(411).json({
      message: "Username and password (min 6 chars) are required"
    });
  }

  const prisma = getPrisma();
  
  try {
    console.log('Testing database connection...');
    
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (connError) {
      console.log('Database connection failed:', connError);
      return res.status(503).json({
        message: "Database temporarily unavailable. Please try again."
      });
    }
    
    console.log('Creating user with username:', body.username);
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        name: body.name || body.username
      }
    });
    
    console.log('User created successfully with ID:', user.id);
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    console.log('Token generated for new user');
    res.json(token);
  } catch(e) {
    console.log('Signup error:', e);
    res.status(411).json({ message: 'Username might already exist or invalid data' });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.log('Error disconnecting from database:', e);
    }
  }
});

// Signin
router.post('/signin', async (req, res) => {
  const body = req.body;
  console.log('Signin request body:', body);
  
  // Custom validation for signin - username can be email or regular string
  if (!body.username || !body.password || body.password.length < 6) {
    console.log('Basic validation failed');
    return res.status(411).json({
      message: "Username and password (min 6 chars) are required"
    });
  }

  const prisma = getPrisma();
  
  try {
    console.log('Testing database connection...');
    
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (connError) {
      console.log('Database connection failed:', connError);
      return res.status(503).json({
        message: "Database temporarily unavailable. Please try again."
      });
    }
    
    console.log('Looking for user with username:', body.username);
    const user = await prisma.user.findFirst({
      where: {
        username: body.username,
      }
    });
    
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found');
      return res.status(403).json({
        message: "User not found"
      });
    }

    console.log('Stored password length:', user.password?.length || 0);
    console.log('Input password length:', body.password.length);
    
    // Simple approach - check if the stored password looks like a hash or plain text
    const isHashedPassword = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
    console.log('Is password hashed?', isHashedPassword);
    
    let isPasswordValid = false;
    
    if (isHashedPassword) {
      // Use bcrypt for hashed passwords
      try {
        isPasswordValid = await bcrypt.compare(body.password, user.password);
        console.log('Bcrypt comparison result:', isPasswordValid);
      } catch (e) {
        console.log('Bcrypt comparison error:', e);
        isPasswordValid = false;
      }
    } else {
      // Direct comparison for plain text passwords
      isPasswordValid = body.password === user.password;
      console.log('Direct comparison result:', isPasswordValid);
    }

    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(403).json({
        message: "Incorrect password"
      });
    }
    
    console.log('Authentication successful, generating token');
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    console.log('Token generated successfully');
    res.json(token);
  } catch(e) {
    console.log('Signin error:', e);
    res.status(500).json({ message: 'Server error during signin' });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.log('Error disconnecting from database:', e);
    }
  }
});

// Follow a user
router.post('/follow/:id', authMiddleware, async (req: AuthRequest, res) => {
  const currentUserId = req.userId!;
  const targetId = Number(req.params.id);
  
  if (!targetId || isNaN(targetId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }
  
  if (currentUserId === targetId) {
    return res.status(400).json({ message: "You can't follow yourself" });
  }

  const prisma = getPrisma();
  
  try {
    // Ensure target exists
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetId,
      }
    });
    res.json({ following: true });
  } catch (e) {
    // Probably already following due to composite PK
    res.json({ following: true });
  }
});

// Unfollow a user
router.post('/unfollow/:id', authMiddleware, async (req: AuthRequest, res) => {
  const currentUserId = req.userId!;
  const targetId = Number(req.params.id);
  
  if (!targetId || isNaN(targetId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }
  
  if (currentUserId === targetId) {
    return res.json({ following: false });
  }

  const prisma = getPrisma();
  
  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetId,
        }
      }
    });
  } catch (e) {
    // Ignore if not following
  }
  res.json({ following: false });
});

// Get if current user follows target user
router.get('/follow/status/:id', authMiddleware, async (req: AuthRequest, res) => {
  const currentUserId = req.userId!;
  const targetId = Number(req.params.id);
  
  const prisma = getPrisma();
  const rel = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetId,
      }
    }
  });
  res.json({ following: !!rel });
});

// List followers of a user
router.get('/:id/followers', async (req, res) => {
  const userId = Number(req.params.id);
  const prisma = getPrisma();
  
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: { select: { id: true, name: true, username: true } }
    }
  });
  
  res.json({
    count: followers.length,
    users: followers.map(f => f.follower)
  });
});

// List users that a user is following
router.get('/:id/following', async (req, res) => {
  const userId = Number(req.params.id);
  const prisma = getPrisma();
  
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: { select: { id: true, name: true, username: true } }
    }
  });
  
  res.json({
    count: following.length,
    users: following.map(f => f.following)
  });
});

// Get user profile with stats
router.get('/profile/:id', async (req: AuthRequest, res) => {
  const userId = Number(req.params.id);
  const currentUserId = await getUserId(req);
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const prisma = getPrisma();
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        _count: {
          select: {
            followers: true,
            following: true,
            blogs: true,
            likes: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get saved posts count using raw SQL
    const savedCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "SavedPost" WHERE "userId" = ${userId}
    ` as any[];

    // Check if current user follows this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const followRelation = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId
          }
        }
      });
      isFollowing = !!followRelation;
    }

    res.json({
      profile: {
        id: user.id,
        name: user.name,
        username: user.username,
        followerCount: user._count.followers,
        followingCount: user._count.following,
        blogCount: user._count.blogs,
        isFollowing
      },
      stats: {
        followerCount: user._count.followers,
        followingCount: user._count.following,
        blogCount: user._count.blogs,
        likeCount: user._count.likes,
        commentCount: user._count.comments,
        savedCount: Number(savedCount[0].count)
      }
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Get user's blog posts
router.get('/profile/:id/posts', async (req: AuthRequest, res) => {
  const userId = Number(req.params.id);
  const currentUserId = await getUserId(req);
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const prisma = getPrisma();
  
  try {
    const blogs = await prisma.blog.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    // If current user is viewing, check their likes and saves
    const blogsWithStatus = await Promise.all(blogs.map(async (blog) => {
      let liked = false;
      let saved = false;
      
      if (currentUserId) {
        const [userLike, savedCheck] = await Promise.all([
          prisma.like.findUnique({
            where: { userId_blogId: { userId: currentUserId, blogId: blog.id } }
          }),
          prisma.$queryRaw`
            SELECT COUNT(*) as count FROM "SavedPost" 
            WHERE "userId" = ${currentUserId} AND "blogId" = ${blog.id}
          ` as Promise<any[]>
        ]);
        liked = !!userLike;
        saved = Number(savedCheck[0].count) > 0;
      }

      return {
        id: blog.id,
        title: blog.title,
        content: blog.content,
        likeCount: blog._count.likes,
        commentCount: blog._count.comments,
        liked,
        saved
      };
    }));

    res.json({ blogs: blogsWithStatus });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching user posts' });
  }
});

// Get user's liked posts
router.get('/profile/:id/likes', async (req: AuthRequest, res) => {
  const userId = Number(req.params.id);
  const currentUserId = await getUserId(req);
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const prisma = getPrisma();
  
  try {
    const likes = await prisma.like.findMany({
      where: { userId },
      include: {
        blog: {
          select: {
            id: true,
            title: true,
            content: true,
            author: { select: { id: true, name: true, username: true } },
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check current user's likes and saves for these posts
    const likesWithStatus = await Promise.all(likes.map(async (like) => {
      let currentUserLiked = false;
      let currentUserSaved = false;
      
      if (currentUserId) {
        const [userLike, savedCheck] = await Promise.all([
          prisma.like.findUnique({
            where: { userId_blogId: { userId: currentUserId, blogId: like.blog.id } }
          }),
          prisma.$queryRaw`
            SELECT COUNT(*) as count FROM "SavedPost" 
            WHERE "userId" = ${currentUserId} AND "blogId" = ${like.blog.id}
          ` as Promise<any[]>
        ]);
        currentUserLiked = !!userLike;
        currentUserSaved = Number(savedCheck[0].count) > 0;
      }

      return {
        id: like.id,
        createdAt: like.createdAt.toISOString(),
        blog: {
          id: like.blog.id,
          title: like.blog.title,
          content: like.blog.content,
          author: like.blog.author,
          likeCount: like.blog._count.likes,
          commentCount: like.blog._count.comments,
          liked: currentUserLiked,
          saved: currentUserSaved
        }
      };
    }));

    res.json({ likes: likesWithStatus });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching liked posts' });
  }
});

// Get user's comments
router.get('/profile/:id/comments', async (req, res) => {
  const userId = Number(req.params.id);
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const prisma = getPrisma();
  
  try {
    const comments = await prisma.comment.findMany({
      where: { userId },
      include: {
        blog: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ 
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        blogId: comment.blogId,
        blog: comment.blog
      }))
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching user comments' });
  }
});

// Get user's saved posts
router.get('/profile/:id/saved', async (req: AuthRequest, res) => {
  const userId = Number(req.params.id);
  const currentUserId = await getUserId(req);
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  // Only allow users to see their own saved posts
  if (currentUserId !== userId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const prisma = getPrisma();
  
  try {
    // Get saved posts using raw SQL with joins
    const savedPosts = await prisma.$queryRaw`
      SELECT 
        sp.id,
        sp."createdAt",
        b.id as "blogId",
        b.title,
        b.content,
        u.id as "authorId",
        u.name as "authorName",
        u.username as "authorUsername",
        (SELECT COUNT(*) FROM "Like" WHERE "blogId" = b.id) as "likeCount",
        (SELECT COUNT(*) FROM "Comment" WHERE "blogId" = b.id) as "commentCount"
      FROM "SavedPost" sp
      JOIN "Blog" b ON sp."blogId" = b.id
      JOIN "User" u ON b."authorId" = u.id
      WHERE sp."userId" = ${userId}
      ORDER BY sp."createdAt" DESC
    ` as any[];

    // Check current user's likes for these posts
    const savedWithStatus = await Promise.all(savedPosts.map(async (saved: any) => {
      const userLike = await prisma.like.findUnique({
        where: { userId_blogId: { userId: currentUserId!, blogId: saved.blogId } }
      });

      return {
        id: saved.id,
        createdAt: saved.createdAt.toISOString(),
        blog: {
          id: saved.blogId,
          title: saved.title,
          content: saved.content,
          author: {
            id: saved.authorId,
            name: saved.authorName,
            username: saved.authorUsername
          },
          likeCount: Number(saved.likeCount),
          commentCount: Number(saved.commentCount),
          liked: !!userLike,
          saved: true
        }
      };
    }));

    res.json({ savedPosts: savedWithStatus });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching saved posts' });
  }
});

// Remove follower (for profile owner)
router.delete('/profile/followers/:followerId', authMiddleware, async (req: AuthRequest, res) => {
  const currentUserId = req.userId!;
  const followerId = Number(req.params.followerId);
  
  if (!followerId || isNaN(followerId)) {
    return res.status(400).json({ message: 'Invalid follower id' });
  }

  const prisma = getPrisma();
  
  try {
    await prisma.follow.deleteMany({
      where: {
        followerId: followerId,
        followingId: currentUserId
      }
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Error removing follower' });
  }
});

// Delete own comment
router.delete('/profile/comments/:commentId', authMiddleware, async (req: AuthRequest, res) => {
  const currentUserId = req.userId!;
  const commentId = Number(req.params.commentId);
  
  if (!commentId || isNaN(commentId)) {
    return res.status(400).json({ message: 'Invalid comment id' });
  }

  const prisma = getPrisma();
  
  try {
    // Verify comment belongs to current user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

export { router as userRouter };