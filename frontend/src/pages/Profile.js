import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../services/api';
import { FaUser, FaVideo, FaTwitter, FaUsers } from 'react-icons/fa';

const Profile = () => {
  const { userId } = useParams();
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 h-48"></div>
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
              <FaUser className="text-gray-500 text-4xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.fullName}</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaVideo className="text-blue-500" />
                <span className="font-semibold">Videos</span>
              </div>
              <p className="text-2xl font-bold mt-2">{user?.videos?.length || 0}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaTwitter className="text-blue-500" />
                <span className="font-semibold">Tweets</span>
              </div>
              <p className="text-2xl font-bold mt-2">{user?.tweets?.length || 0}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaUsers className="text-blue-500" />
                <span className="font-semibold">Subscribers</span>
              </div>
              <p className="text-2xl font-bold mt-2">{user?.subscribers || 0}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user?.videos?.map((video) => (
                <div key={video._id} className="bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {video.views} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 