import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import videoReducer from './slices/videoSlice';
import tweetReducer from './slices/tweetSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    video: videoReducer,
    tweet: tweetReducer,
  },
});

export default store; 