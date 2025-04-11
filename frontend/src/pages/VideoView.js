import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getVideo, toggleVideoLike, addComment, updateVideoViews, getVideoComments } from '../services/api';
import { FaThumbsUp, FaEye, FaClock, FaUser, FaRegThumbsUp } from 'react-icons/fa';

const VideoView = () => {
  const { videoId } = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [comment, setComment] = useState('');
  const hasUpdatedViews = useRef(false);
  const videoRef = useRef(null);
  const isLiking = useRef(false);

  const { data: video, isLoading: videoLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const response = await getVideo(videoId);
      console.log('Video data:', response.data);
      return response.data.data;
    }
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      const response = await getVideoComments(videoId);
      return response.data.data.comments || [];
    }
  });

  const viewMutation = useMutation({
    mutationFn: () => updateVideoViews(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleVideoLike(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['video', videoId]);
    }
  });

  const commentMutation = useMutation({
    mutationFn: (content) => addComment(videoId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', videoId]);
      setComment('');
    }
  });

  useEffect(() => {
    if (video && !hasUpdatedViews.current) {
      // Only update views if video has been watched for at least 30 seconds
      const timer = setTimeout(() => {
        if (videoRef.current && videoRef.current.currentTime >= 30) {
          viewMutation.mutate();
          hasUpdatedViews.current = true;
        }
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [video, viewMutation]);

  const handleLike = () => {
    if (!isAuthenticated) return;
    likeMutation.mutate();
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim() || !isAuthenticated) return;
    commentMutation.mutate(comment);
  };

  if (videoLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={video?.videoFile}
              controls
              className="w-full aspect-video"
              poster={video?.thumbnail}
            />
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{video?.title}</h1>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <FaEye className="mr-2" />
                  {video?.views} views
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-2" />
                  {new Date(video?.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  video?.isLiked
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
                disabled={!isAuthenticated || likeMutation.isPending}
              >
                {video?.isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                <span>{video?.likes || 0}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3 mt-4">
              <FaUser className="text-gray-600 text-xl" />
              <div>
                <h3 className="font-semibold">{video?.owner?.fullName}</h3>
                <p className="text-gray-600 text-sm">
                  {video?.owner?.subscribers || 0} subscribers
                </p>
              </div>
            </div>
            <p className="mt-4 text-gray-700">{video?.description}</p>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            {isAuthenticated ? (
              <form onSubmit={handleComment} className="mb-6">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a comment..."
                  rows="3"
                />
                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  disabled={commentMutation.isPending}
                >
                  {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <p className="text-gray-600 mb-6">
                Please login to comment on this video.
              </p>
            )}

            {commentsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-gray-100 h-20 rounded-lg"></div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <img
                        src={comment.user?.avatar}
                        alt={comment.user?.fullName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-semibold">{comment.user?.fullName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h3 className="text-xl font-semibold mb-4">Related Videos</h3>
          {/* Add related videos here */}
        </div>
      </div>
    </div>
  );
};

export default VideoView; 