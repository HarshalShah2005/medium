import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Appbar } from '../components/Appbar';
import { Spinner } from '../components/Spinner';
import { BlogCard } from '../components/BlogCard';
import { BACKEND_URL } from '../config';
import { 
  UserProfile, 
  ProfileStats, 
  ProfileTab, 
  ProfileBlog, 
  ProfileLike, 
  ProfileComment, 
  ProfileSavedPost,
  FollowUser 
} from '@100xdevs/medium-common';

interface ProfileResponse {
  profile: UserProfile;
  stats: ProfileStats;
}

export function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [posts, setPosts] = useState<ProfileBlog[]>([]);
  const [likes, setLikes] = useState<ProfileLike[]>([]);
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [savedPosts, setSavedPosts] = useState<ProfileSavedPost[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  
  const currentUserId = localStorage.getItem('userId');
  const isOwnProfile = currentUserId === id;

  // Get auth headers
  const getAuthHeaders = () => ({
    'Authorization': localStorage.getItem('token') || '',
    'Content-Type': 'application/json'
  });

  // Fetch profile data
  useEffect(() => {
    if (!id) return;
    
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/user/profile/${id}`, {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data: ProfileResponse = await response.json();
        setProfile(data.profile);
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Fetch tab data
  useEffect(() => {
    if (!id || !profile) return;
    
    const fetchTabData = async () => {
      setTabLoading(true);
      try {
        let endpoint = '';
        
        switch (activeTab) {
          case 'posts':
            endpoint = `/api/v1/user/profile/${id}/posts`;
            break;
          case 'likes':
            endpoint = `/api/v1/user/profile/${id}/likes`;
            break;
          case 'comments':
            endpoint = `/api/v1/user/profile/${id}/comments`;
            break;
          case 'saved':
            endpoint = `/api/v1/user/profile/${id}/saved`;
            break;
        }

        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error(`Failed to fetch ${activeTab}`);
        
        const data = await response.json();
        
        switch (activeTab) {
          case 'posts':
            setPosts(data.blogs || []);
            break;
          case 'likes':
            setLikes(data.likes || []);
            break;
          case 'comments':
            setComments(data.comments || []);
            break;
          case 'saved':
            setSavedPosts(data.savedPosts || []);
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab}:`, error);
      } finally {
        setTabLoading(false);
      }
    };

    fetchTabData();
  }, [id, activeTab, profile]);

  // Follow/Unfollow user
  const handleFollowToggle = async () => {
    if (!profile || isOwnProfile) return;
    
    try {
      const endpoint = profile.isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`${BACKEND_URL}/api/v1/user/${endpoint}/${id}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error(`Failed to ${endpoint}`);
      
      setProfile(prev => prev ? {
        ...prev,
        isFollowing: !prev.isFollowing,
        followerCount: prev.isFollowing ? prev.followerCount - 1 : prev.followerCount + 1
      } : null);
      
      setStats(prev => prev ? {
        ...prev,
        followerCount: profile.isFollowing ? prev.followerCount - 1 : prev.followerCount + 1
      } : null);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  // Fetch followers/following
  const fetchFollowers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/user/${id}/followers`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setFollowers(data.users || []);
        setShowFollowers(true);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/user/${id}/following`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.users || []);
        setShowFollowing(true);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  // Remove follower (only for own profile)
  const removeFollower = async (followerId: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/user/profile/followers/${followerId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        setFollowers(prev => prev.filter(f => f.id !== followerId));
        setStats(prev => prev ? { ...prev, followerCount: prev.followerCount - 1 } : null);
      }
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  };

  // Delete post
  const deletePost = async (postId: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/blog/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        setStats(prev => prev ? { ...prev, blogCount: prev.blogCount - 1 } : null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Delete comment
  const deleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/user/profile/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setStats(prev => prev ? { ...prev, commentCount: prev.commentCount - 1 } : null);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Unlike post
  const unlikePost = async (blogId: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/blog/${blogId}/like`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        setLikes(prev => prev.filter(l => l.blog.id !== blogId));
        setStats(prev => prev ? { ...prev, likeCount: prev.likeCount - 1 } : null);
      }
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  };

  // Unsave post
  const unsavePost = async (blogId: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/blog/${blogId}/save`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        setSavedPosts(prev => prev.filter(s => s.blog.id !== blogId));
        setStats(prev => prev ? { ...prev, savedCount: prev.savedCount - 1 } : null);
      }
    } catch (error) {
      console.error('Error unsaving post:', error);
    }
  };

  if (loading) {
    return (
      <div>
        <Appbar />
        <div className="flex justify-center items-center h-screen">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Appbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Appbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Profile Picture Placeholder */}
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-semibold text-gray-600">
                {profile.name?.charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.name || profile.username}
                </h1>
                <p className="text-gray-600">@{profile.username}</p>
                
                {/* Stats */}
                <div className="flex space-x-6 mt-3 text-sm">
                  <button
                    onClick={fetchFollowers}
                    className="hover:text-blue-600 transition-colors"
                  >
                    <span className="font-semibold">{stats?.followerCount || 0}</span> followers
                  </button>
                  <button
                    onClick={fetchFollowing}
                    className="hover:text-blue-600 transition-colors"
                  >
                    <span className="font-semibold">{stats?.followingCount || 0}</span> following
                  </button>
                  <span>
                    <span className="font-semibold">{stats?.blogCount || 0}</span> posts
                  </span>
                </div>
              </div>
            </div>
            
            {/* Follow Button */}
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  profile.isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {profile.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <div className="flex space-x-1">
              {(['posts', 'likes', 'comments', 'saved'] as ProfileTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium text-sm capitalize transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab} ({
                    tab === 'posts' ? stats?.blogCount :
                    tab === 'likes' ? stats?.likeCount :
                    tab === 'comments' ? stats?.commentCount :
                    stats?.savedCount
                  })
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {tabLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div>
                {/* Posts Tab */}
                {activeTab === 'posts' && (
                  <div className="space-y-4">
                    {posts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No posts yet
                      </div>
                    ) : (
                      posts.map((post) => (
                        <div key={post.id} className="relative">
                          <BlogCard
                            id={post.id}
                            authorName={profile.name || profile.username}
                            title={post.title}
                            content={post.content}
                            publishedDate=""
                          />
                          {isOwnProfile && (
                            <div className="absolute top-4 right-4 flex space-x-2">
                              <button
                                onClick={() => navigate(`/publish?edit=${post.id}`)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deletePost(post.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Likes Tab */}
                {activeTab === 'likes' && (
                  <div className="space-y-4">
                    {likes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No liked posts yet
                      </div>
                    ) : (
                      likes.map((like) => (
                        <div key={like.id} className="relative">
                          <BlogCard
                            id={like.blog.id}
                            authorName={like.blog.author?.name || like.blog.author?.username || ''}
                            title={like.blog.title}
                            content={like.blog.content}
                            publishedDate=""
                          />
                          {isOwnProfile && (
                            <button
                              onClick={() => unlikePost(like.blog.id)}
                              className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Unlike
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No comments yet
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4 relative">
                          <div className="flex justify-between items-start mb-2">
                            <button
                              onClick={() => navigate(`/blog/${comment.blogId}`)}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {comment.blog.title}
                            </button>
                            {isOwnProfile && (
                              <button
                                onClick={() => deleteComment(comment.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{comment.content}</p>
                          <p className="text-gray-500 text-sm">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Saved Tab */}
                {activeTab === 'saved' && (
                  <div className="space-y-4">
                    {savedPosts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No saved posts yet
                      </div>
                    ) : (
                      savedPosts.map((saved) => (
                        <div key={saved.id} className="relative">
                          <BlogCard
                            id={saved.blog.id}
                            authorName={saved.blog.author?.name || saved.blog.author?.username || ''}
                            title={saved.blog.title}
                            content={saved.blog.content}
                            publishedDate=""
                          />
                          <button
                            onClick={() => unsavePost(saved.blog.id)}
                            className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Unsave
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Followers</h3>
              <button
                onClick={() => setShowFollowers(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {followers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No followers yet</p>
              ) : (
                <div className="space-y-3">
                  {followers.map((follower) => (
                    <div key={follower.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                          {follower.name?.charAt(0).toUpperCase() || follower.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{follower.name || follower.username}</p>
                          <p className="text-sm text-gray-500">@{follower.username}</p>
                        </div>
                      </div>
                      {isOwnProfile && (
                        <button
                          onClick={() => removeFollower(follower.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Following</h3>
              <button
                onClick={() => setShowFollowing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {following.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Not following anyone yet</p>
              ) : (
                <div className="space-y-3">
                  {following.map((followingUser) => (
                    <div key={followingUser.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                          {followingUser.name?.charAt(0).toUpperCase() || followingUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{followingUser.name || followingUser.username}</p>
                          <p className="text-sm text-gray-500">@{followingUser.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/profile/${followingUser.id}`)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}