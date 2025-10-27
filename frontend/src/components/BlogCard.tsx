import { Link } from "react-router-dom";
import { LikeButton } from "./LikeButton";
import { SaveButton } from "./SaveButton";

interface BlogCardProps {
    authorName: string;
    title: string;
    content: string;
    publishedDate: string;
    id: number;
    liked?: boolean;
    likeCount?: number;
    commentCount?: number;
    saved?: boolean;
    _count?: {
        likes?: number;
        comments?: number;
    };
}

// Helper function to strip markdown and get plain text preview
const getPlainTextPreview = (markdown: string, maxLength: number = 150): string => {
    // Remove markdown syntax
    const plainText = markdown
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove inline code
        .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
        .replace(/>\s+/g, '') // Remove blockquotes
        .replace(/[-*+]\s+/g, '') // Remove list markers
        .replace(/\d+\.\s+/g, '') // Remove numbered list markers
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

    return plainText.length > maxLength 
        ? plainText.substring(0, maxLength) + "..."
        : plainText;
};

export const BlogCard = ({
    id,
    authorName,
    title,
    content,
    publishedDate,
    liked,
    likeCount,
    commentCount,
    saved,
    _count
}: BlogCardProps) => {
    const plainTextPreview = getPlainTextPreview(content);
    const readTime = Math.ceil(content.length / 500); // Approximate reading time

    return <div className="p-4 border-b border-slate-200 pb-4 w-screen max-w-screen-md cursor-pointer">
        <div className="flex">
            <Avatar name={authorName} />
            <div className="font-extralight pl-2 text-sm flex justify-center flex-col">{authorName}</div>
            <div className="flex justify-center flex-col pl-2">
                <Circle />
            </div>
            <div className="pl-2 font-thin text-slate-500 text-sm flex justify-center flex-col">
                {publishedDate}
            </div>
        </div>
        <Link to={`/blog/${id}`}>
            <div className="text-xl font-semibold pt-2 hover:text-gray-700 transition-colors">
                {title}
            </div>
            <div className="text-md font-thin text-gray-600 leading-relaxed">
                {plainTextPreview}
            </div>
            <div className="text-slate-500 text-sm font-thin pt-4">
                {`${readTime} min read`}
            </div>
        </Link>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4">
                <LikeButton 
                    blogId={id} 
                    initialLiked={liked || false} 
                    initialLikeCount={likeCount || _count?.likes || 0} 
                />
                <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm">{commentCount || _count?.comments || 0}</span>
                </div>
            </div>
            <SaveButton 
                blogId={id} 
                initialSaved={saved || false} 
            />
        </div>
    </div>
}
export function Circle() {
    return <div className="h-1 w-1 rounded-full bg-slate-500">

    </div>
}

export function Avatar({ name, size = "small" }: { name: string, size?: "small" | "big" }) {
    return <div className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-600 rounded-full ${size === "small" ? "w-6 h-6" : "w-10 h-10"}`}>
    <span className={`${size === "small" ? "text-xs" : "text-md"} font-extralight text-gray-600 dark:text-gray-300`}>
        {name[0]}
    </span>
</div>
}