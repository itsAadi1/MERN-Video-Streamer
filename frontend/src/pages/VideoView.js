import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getVideo, toggleVideoLike, addComment, updateVideoViews } from '../services/api';
import { FaThumbsUp, FaEye, FaClock, FaUser } from 'react-icons/fa';

const VideoView = () => {
  const { videoId } = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [comment, setComment] = useState('');
  const hasUpdatedViews = useRef(false);
  const videoRef = useRef(null);
  const isLiking = useRef(false);

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const response = await getVideo(videoId);
      console.log('Video data:', response.data);
      return response.data.data;
    }
  });

  const viewMutation = useMutation({
    mutationFn: () => updateVideoViews(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiking.current) return;
      isLiking.current = true;
      console.log('Toggling like for video:', videoId);
      const response = await toggleVideoLike(videoId);
      console.log('Like response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Like success:', data);
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      isLiking.current = false;
    },
    onError: (error) => {
      console.error('Like error:', error);
      isLiking.current = false;
    }
  });

  const commentMutation = useMutation({
    mutationFn: (content) => addComment(videoId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      setComment('');
    },
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
    if (isAuthenticated && !isLiking.current) {
      likeMutation.mutate();
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (comment.trim() && isAuthenticated) {
      commentMutation.mutate(comment);
    }
  };

  if (isLoading) {
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
                disabled={!isAuthenticated || likeMutation.isLoading || isLiking.current}
              >
                <FaThumbsUp />
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
                  disabled={!comment.trim()}
                >
                  Comment
                </button>
              </form>
            ) : (
              <p className="text-gray-600 mb-6">
                Please login to comment on this video.
              </p>
            )}

            {video?.comments?.map((comment) => (
              <div key={comment._id} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FaUser className="text-gray-600" />
                  <span className="font-semibold">
                    {comment.user?.fullName}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
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