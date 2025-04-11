import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  videos: [],
  currentVideo: null,
  loading: false,
  error: null,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideos: (state, action) => {
      state.videos = action.payload;
    },
    setCurrentVideo: (state, action) => {
      state.currentVideo = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setVideos, setCurrentVideo, setLoading, setError } = videoSlice.actions;

export default videoSlice.reducer; 