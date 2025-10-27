import { useEffect, useState, useCallback } from "react"
import axios from "axios";
import { BACKEND_URL } from "../config";

export interface Blog {
    "content": string;
    "title": string;
    "id": number
    "author": {
        "id": number;
        "name": string
    }
    "liked"?: boolean;
    "saved"?: boolean;
    "likeCount"?: number;
    "commentCount"?: number;
    "_count"?: {
        "likes": number;
        "comments": number;
    }
}

// Cache for blogs to avoid refetching
const blogCache = new Map<string, { data: Blog, timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();

    const fetchBlog = useCallback(async () => {
        // Check cache first
        const cacheKey = `blog-${id}`;
        const cached = blogCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setBlog(cached.data);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            
            const blogData = response.data.blog;
            setBlog(blogData);
            
            // Cache the result
            blogCache.set(cacheKey, { data: blogData, timestamp: Date.now() });
        } catch (error) {
            console.error("Error fetching blog:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchBlog();
    }, [fetchBlog]);

    return {
        loading,
        blog,
        refetch: fetchBlog
    }
}

// Cache for blogs list
let blogsCache: { data: Blog[], timestamp: number } | null = null;

export const useBlogs = () => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);

    const fetchBlogs = useCallback(async () => {
        // Check cache first
        if (blogsCache && Date.now() - blogsCache.timestamp < CACHE_DURATION) {
            setBlogs(blogsCache.data);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            
            const blogsData = response.data.blogs;
            setBlogs(blogsData);
            
            // Cache the result
            blogsCache = { data: blogsData, timestamp: Date.now() };
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    return {
        loading,
        blogs,
        refetch: fetchBlogs
    }
}