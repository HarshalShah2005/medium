import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Avatar } from "./BlogCard";

interface User {
  id: number;
  name: string;
  username: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: User;
  replies?: Comment[];
}

interface CommentsProps {
  blogId: number;
}

function CommentItem({ comment, onReplySubmitted }: { 
  comment: Comment; 
  onReplySubmitted: (parentId: number, newReply: Comment) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const token = localStorage.getItem("token");

  const handleReply = async () => {
    if (!replyContent.trim() || submittingReply) return;
    
    setSubmittingReply(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/blog/comment/${comment.id}/reply`, {
        content: replyContent.trim()
      }, {
        headers: { Authorization: token || "" }
      });
      
      // Optimistically add the reply
      const newReply = response.data.reply;
      setReplies(prev => [...prev, newReply]);
      onReplySubmitted(comment.id, newReply);
      
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-4">
      <div className="flex gap-3">
        <Avatar name={comment.user.name || comment.user.username} size="small" />
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.user.name || comment.user.username}</span>
              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{comment.content}</p>
          </div>
          
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Reply
            </button>
          </div>

          {showReplyForm && (
            <div className="mt-3 ml-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim() || submittingReply}
                  className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submittingReply ? "Posting..." : "Reply"}
                </button>
                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                  className="px-4 py-2 text-gray-600 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Render replies */}
          {replies.length > 0 && (
            <div className="mt-4 ml-8 space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <Avatar name={reply.user.name || reply.user.username} size="small" />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{reply.user.name || reply.user.username}</span>
                        <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Comments({ blogId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/blog/${blogId}/comments`, {
        headers: { Authorization: token || "" }
      });
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [blogId, token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/blog/${blogId}/comments`, {
        content: newComment.trim()
      }, {
        headers: { Authorization: token || "" }
      });
      
      // Optimistically add the new comment
      const newCommentData = response.data.comment;
      setComments(prev => [newCommentData, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmitted = useCallback((parentId: number, newReply: Comment) => {
    // Update the parent comment to include the new reply
    setComments(prev => prev.map(comment => 
      comment.id === parentId 
        ? { ...comment, replies: [...(comment.replies || []), newReply] }
        : comment
    ));
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmitComment();
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Comments</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-6">Comments ({comments.length})</h3>
      
      {/* New comment form */}
      <div className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="What are your thoughts?"
          className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          rows={4}
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500">
            Press Ctrl+Enter to submit
          </span>
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onReplySubmitted={handleReplySubmitted}
            />
          ))
        )}
      </div>
    </div>
  );
}