import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

interface LikeButtonProps {
  blogId: number;
  initialLiked?: boolean;
  initialLikeCount?: number;
}

export function LikeButton({ blogId, initialLiked = false, initialLikeCount = 0 }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [initialLiked, initialLikeCount]);

  const toggleLike = async () => {
    if (loading) return;
    
    // Optimistic update
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    
    setLiked(newLiked);
    setLikeCount(newCount);
    setLoading(true);

    try {
      let response;
      if (liked) {
        // Unlike
        response = await axios.delete(`${BACKEND_URL}/api/v1/blog/${blogId}/like`, {
          headers: { Authorization: token || "" }
        });
      } else {
        // Like
        response = await axios.post(`${BACKEND_URL}/api/v1/blog/${blogId}/like`, {}, {
          headers: { Authorization: token || "" }
        });
      }
      
      // Update with server response
      setLikeCount(response.data.likeCount || newCount);
      setLiked(response.data.liked !== undefined ? response.data.liked : newLiked);
    } catch (error) {
      // Revert optimistic update on error
      setLiked(!newLiked);
      setLikeCount(likeCount);
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
        liked 
          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
      } ${loading ? 'opacity-75' : 'cursor-pointer hover:scale-105'}`}
    >
      <svg
        className={`w-5 h-5 transition-all duration-200 ${
          liked ? 'fill-red-500 scale-110' : 'fill-none stroke-current'
        }`}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="text-sm font-medium">
        {likeCount}
      </span>
    </button>
  );
}