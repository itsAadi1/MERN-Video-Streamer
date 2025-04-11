import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tweets: [],
  loading: false,
  error: null,
};

const tweetSlice = createSlice({
  name: 'tweet',
  initialState,
  reducers: {
    setTweets: (state, action) => {
      state.tweets = action.payload;
    },
    addTweet: (state, action) => {
      state.tweets.unshift(action.payload);
    },
    updateTweet: (state, action) => {
      const index = state.tweets.findIndex(tweet => tweet._id === action.payload._id);
      if (index !== -1) {
        state.tweets[index] = action.payload;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setTweets, addTweet, updateTweet, setLoading, setError } = tweetSlice.actions;

export default tweetSlice.reducer; 