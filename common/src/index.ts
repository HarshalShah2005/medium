import z from "zod";

export const signupInput = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
})

export type SignupInput = z.infer<typeof signupInput>

export const signinInput = z.object({
    username: z.string().email(),
    password: z.string().min(6),
})

export type SigninInput = z.infer<typeof signinInput>

export const createBlogInput = z.object({
    title: z.string(),
    content: z.string(),
})
export type CreateBlogInput = z.infer<typeof createBlogInput>

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.number()
})
export type UpdateBlogInput = z.infer<typeof updateBlogInput>

// Profile related types
export interface UserProfile {
    id: number;
    name: string | null;
    username: string;
    followerCount: number;
    followingCount: number;
    blogCount: number;
    isFollowing?: boolean;
}

export interface FollowUser {
    id: number;
    name: string | null;
    username: string;
}

export interface ProfileStats {
    followerCount: number;
    followingCount: number;
    blogCount: number;
    likeCount: number;
    commentCount: number;
    savedCount: number;
}

export interface ProfileBlog {
    id: number;
    title: string;
    content: string;
    createdAt?: string;
    likeCount: number;
    commentCount: number;
    liked?: boolean;
    saved?: boolean;
}

export interface ProfileComment {
    id: number;
    content: string;
    createdAt: string;
    blogId: number;
    blog: {
        id: number;
        title: string;
    };
}

export interface ProfileLike {
    id: number;
    createdAt: string;
    blog: ProfileBlog;
}

export interface ProfileSavedPost {
    id: number;
    createdAt: string;
    blog: ProfileBlog;
}

export type ProfileTab = 'posts' | 'likes' | 'comments' | 'saved';