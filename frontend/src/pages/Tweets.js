import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createTweet, getTweets, toggleTweetLike } from '../services/api';
import { FaUser, FaHeart, FaClock } from 'react-icons/fa';

const Tweets = () => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { data: tweets, isLoading } = useQuery({
    queryKey: ['tweets'],
    queryFn: async () => {
      const response = await getTweets();
      return response.data.data;
    }
  });

  const createTweetMutation = useMutation({
    mutationFn: (data) => createTweet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      setContent('');
    },
  });

  const likeTweetMutation = useMutation({
    mutationFn: (tweetId) => toggleTweetLike(tweetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      createTweetMutation.mutate({ content });
    }
  };

  const handleLike = (tweetId) => {
    likeTweetMutation.mutate(tweetId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's happening?"
            rows="3"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
              disabled={!content.trim() || createTweetMutation.isLoading}
            >
              Tweet
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {tweets?.map((tweet) => (
          <div key={tweet._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FaUser className="text-gray-600 text-xl" />
              <div>
                <h3 className="font-semibold">{tweet.owner?.fullName}</h3>
                <div className="flex items-center text-gray-500 text-sm">
                  <FaClock className="mr-1" />
                  {new Date(tweet.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <p className="text-gray-800 mb-4">{tweet.content}</p>
            <button
              onClick={() => handleLike(tweet._id)}
              className={`flex items-center space-x-2 text-sm ${
                tweet.isLiked ? 'text-red-500' : 'text-gray-500'
              } hover:text-red-500`}
            >
              <FaHeart />
              <span>{tweet.likes || 0}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tweets; 