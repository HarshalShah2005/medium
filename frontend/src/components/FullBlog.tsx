import { Blog } from "../hooks"
import { Appbar } from "./Appbar"
import { Avatar } from "./BlogCard"
import { FollowButton } from "./FollowButton"
import { LikeButton } from "./LikeButton"
import { SaveButton } from "./SaveButton"
import { Comments } from "./Comments"
import HtmlContentRenderer from "./HtmlContentRenderer"
import BlogAISummary from "./BlogAISummary"

export const FullBlog = ({ blog }: {blog: Blog}) => {
    return <div>
        <Appbar />
        <div className="flex justify-center">
            <div className="grid grid-cols-12 px-10 w-full pt-200 max-w-screen-xl pt-12">
                <div className="col-span-8">
                    <div className="text-5xl font-extrabold">
                        {blog.title}
                    </div>
                    <div className="text-slate-500 pt-2">
                        Post on 2nd December 2023
                    </div>
                    <div className="pt-4">
                        <HtmlContentRenderer content={blog.content} />
                    </div>
                    
                    {/* Like and interaction buttons */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                            <LikeButton 
                                blogId={blog.id} 
                                initialLiked={blog.liked} 
                                initialLikeCount={blog.likeCount || blog._count?.likes || 0} 
                            />
                            <div className="flex items-center gap-2 text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="text-sm">{blog.commentCount || blog._count?.comments || 0}</span>
                            </div>
                        </div>
                        <SaveButton 
                            blogId={blog.id} 
                            initialSaved={blog.saved || false} 
                        />
                    </div>
                </div>
                <div className="col-span-4">
                    {/* AI Summary Section */}
                    <BlogAISummary 
                        blogTitle={blog.title}
                        blogContent={blog.content}
                    />
                    
                    <div className="text-slate-600 text-lg">
                        Author
                    </div>
                    <div className="flex w-full items-start">
                        <div className="pr-4 flex flex-col justify-center">
                            <Avatar size="big" name={blog.author.name || "Anonymous"} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xl font-bold">
                                {blog.author.name || "Anonymous"}
                            </div>
                            <div className="pt-2 text-slate-500">
                                Random catch phrase about the author's ability to grab the user's attention
                            </div>
                        </div>
                        <FollowButton userId={blog.author.id} />
                    </div>  
                </div>
            </div>
            
            {/* Comments section */}
            <div className="max-w-4xl mx-auto px-10 pb-12">
                <Comments blogId={blog.id} />
            </div>
        </div>
    </div>
}