import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserChannelProfile, toggleSubscription } from '../services/api';
import { FaUser, FaVideo, FaTwitter, FaUsers } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Profile = () => {
  const { username } = useParams();
  const { isAuthenticated, user: currentUser } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const navigate=useNavigate();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      const response = await getUserChannelProfile(username);
      return response.data.data;
    }
  });

  const subscribeMutation = useMutation({
    mutationFn: () => toggleSubscription(user._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', username]);
    }
  });

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return;
    }
    subscribeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">Error loading profile</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === user?._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 h-48">
          {user?.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-gray-500 text-4xl" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.fullName}</h1>
                <p className="text-gray-600">@{user?.username}</p>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            {!isOwnProfile && isAuthenticated && (
              <button
                onClick={handleSubscribe}
                disabled={subscribeMutation.isPending}
                className={`px-6 py-2 rounded-full font-semibold ${
                  user?.isSubscribed
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } transition-colors duration-200`}
              >
                {subscribeMutation.isPending ? 'Loading...' : user?.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaVideo className="text-blue-500" />
                <span className="font-semibold">Videos</span>
              </div>
              <p className="text-2xl font-bold mt-2">{user?.videosCount || 0}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaTwitter className="text-blue-500" />
                <span className="font-semibold">Tweets</span>
              </div>
              <p className="text-2xl font-bold mt-2">{user?.tweetsCount || 0}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaUsers className="text-blue-500" />
                <span className="font-semibold">Subscribers</span>
              </div>
              <p className="text-2xl font-bold mt-2">{user?.subscribersCount || 0}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user?.videos?.map((video) => (
                <Link 
                  to={`/video/${video._id}`} 
                  key={video._id}
                  className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 hover:text-blue-600">{video.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {video.views} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 