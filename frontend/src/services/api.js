import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('API Request - Token:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't override Content-Type if it's already set (e.g., for multipart/form-data)
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    console.log('API Request - Config:', config);
    return config;
  },
  (error) => {
    console.error('API Request - Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on authentication error
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = (credentials) => api.post('/users/login', {
  email: credentials.email,
  password: credentials.password
});
export const register = (userData) => api.post('/users/register', userData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const getCurrentUser = () => api.get('/users/current-user');
export const updateProfile = (userData) => api.patch('/users/update-account', userData);
export const getUserChannelProfile = (username) => api.get(`/users/c/${username}`);

// Video API
export const uploadVideo = (formData) => api.post('/videos', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const getVideos = (params) => api.get('/videos', { params });
export const getVideo = (videoId) => api.get(`/videos/${videoId}`);
export const updateVideoViews = (videoId) => api.patch(`/videos/views/${videoId}`);
export const toggleVideoLike = (videoId) => api.post(`/likes/toggle/v/${videoId}`);
export const addComment = (videoId, content) => api.post(`/comments/${videoId}`, content);
export const getVideoComments = (videoId) => api.get(`/comments/${videoId}`);

// Tweet API
export const createTweet = (content) => api.post('/tweets', { content });
export const getTweets = () => api.get('/tweets');
export const toggleTweetLike = (tweetId) => api.post(`/likes/toggle/t/${tweetId}`);
export const deleteTweet=(tweetId)=>api.delete(`/tweets/${tweetId}`)

// Subscription API
export const toggleSubscription = (channelId) => api.post(`/subscriptions/c/${channelId}`);
export const getSubscriptions = () => api.get('/subscriptions');

// Like API
export const getLikedVideos = () => api.get('/likes');

export default api; 