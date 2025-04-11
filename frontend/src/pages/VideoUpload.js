import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { uploadVideo } from '../services/api';
import { FaUpload, FaSpinner } from 'react-icons/fa';

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const VideoUpload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
  });
  const [error, setError] = useState('');

  const uploadMutation = useMutation({
    mutationFn: uploadVideo,
    onSuccess: () => {
      navigate('/');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to upload video');
    },
  });

  const validateFile = (file, maxSize, allowedTypes, fileType) => {
    if (!file) return `${fileType} is required`;
    if (!allowedTypes.includes(file.type)) 
      return `Invalid ${fileType} format. Allowed formats: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`;
    if (file.size > maxSize) 
      return `${fileType} size should be less than ${maxSize / (1024 * 1024)}MB`;
    return null;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (name === 'videoFile') {
        const error = validateFile(file, MAX_VIDEO_SIZE, ALLOWED_VIDEO_TYPES, 'Video');
        if (error) {
          setError(error);
          e.target.value = '';
          return;
        }
      } else if (name === 'thumbnail') {
        const error = validateFile(file, MAX_THUMBNAIL_SIZE, ALLOWED_IMAGE_TYPES, 'Thumbnail');
        if (error) {
          setError(error);
          e.target.value = '';
          return;
        }
      }
      setError('');
    }
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    // Validate files
    const videoError = validateFile(formData.videoFile, MAX_VIDEO_SIZE, ALLOWED_VIDEO_TYPES, 'Video');
    if (videoError) {
      setError(videoError);
      return;
    }

    const thumbnailError = validateFile(formData.thumbnail, MAX_THUMBNAIL_SIZE, ALLOWED_IMAGE_TYPES, 'Thumbnail');
    if (thumbnailError) {
      setError(thumbnailError);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('videoFile', formData.videoFile);
    data.append('thumbnail', formData.thumbnail);

    uploadMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Upload Video</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter video title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter video description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video File
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaUpload className="text-gray-500 text-3xl mb-2" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    MP4, WebM or MOV (MAX. 100MB)
                  </p>
                </div>
                <input
                  type="file"
                  name="videoFile"
                  onChange={handleChange}
                  required
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                />
              </label>
            </div>
            {formData.videoFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {formData.videoFile.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaUpload className="text-gray-500 text-3xl mb-2" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG or JPEG (MAX. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  name="thumbnail"
                  onChange={handleChange}
                  required
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                />
              </label>
            </div>
            {formData.thumbnail && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {formData.thumbnail.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploadMutation.isLoading}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {uploadMutation.isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              'Upload Video'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload; 