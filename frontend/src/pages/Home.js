import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getVideos } from '../services/api';
import { FaEye, FaClock } from 'react-icons/fa';

const Home = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await getVideos();
      console.log('API Response:', response); // Debug log
      return response.data; // This returns the entire response data
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    console.error('Error fetching videos:', error); // Debug log
    return (
      <div className="text-center text-red-500 mt-8">
        Error loading videos: {error.message}
      </div>
    );
  }

  console.log('Processed data:', data); // Debug log
  
  // Access the nested videos array correctly
  const videos = data?.data?.videos || [];

  if (videos.length === 0) {
    return (
      <div className="text-center mt-8">
        <p className="text-gray-600">No videos found. Upload a video to get started!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Latest Videos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Link
            key={video._id}
            to={`/video/${video._id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-2 py-1 rounded">
                {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {video.title}
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <div className="flex items-center mr-4">
                  <FaEye className="mr-1" />
                  {video.views} views
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-1" />
                  {new Date(video.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {video.owner?.fullName}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home; 