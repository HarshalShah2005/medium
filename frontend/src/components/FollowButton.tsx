import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export function FollowButton({ userId }: { userId: number }) {
  if (!userId) return null;
  
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    let ignore = false;
    async function fetchStatus() {
      if (!userId) return;
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/user/follow/status/${userId}`, {
          headers: { Authorization: token || "" }
        });
        if (!ignore) {
          setFollowing(!!res.data.following);
        }
      } catch {
        // ignore
      } finally {
        if (!ignore) setInitialLoad(false);
      }
    }
    fetchStatus();
    return () => { ignore = true; }
  }, [userId, token]);

  const onToggle = async () => {
    if (loading) return;
    
    // Optimistic update
    const newState = !following;
    setFollowing(newState);
    setLoading(true);
    
    try {
      if (following) {
        await axios.post(`${BACKEND_URL}/api/v1/user/unfollow/${userId}`, {}, {
          headers: { Authorization: token || "" }
        });
      } else {
        await axios.post(`${BACKEND_URL}/api/v1/user/follow/${userId}`, {}, {
          headers: { Authorization: token || "" }
        });
      }
    } catch (error) {
      // Revert on error
      setFollowing(!newState);
      console.error("Error toggling follow:", error);
    } finally {
      setLoading(false);
    }
  }

  if (initialLoad) {
    return (
      <div className="ml-3 rounded-full px-3 py-1 text-sm border border-gray-300 bg-gray-100 animate-pulse">
        <span className="text-gray-400">...</span>
      </div>
    );
  }

  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`ml-3 rounded-full px-3 py-1 text-sm border transition-all duration-200 ${
        following 
          ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-700' 
          : 'bg-white text-gray-800 border-gray-800 hover:bg-gray-50'
      } ${loading ? 'opacity-75' : ''}`}
      title={following ? 'Unfollow' : 'Follow'}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
