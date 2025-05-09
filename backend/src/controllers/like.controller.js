import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    console.log('Toggle like request for video:', videoId); // Debug log

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existing = await Like.findOne({ video: videoId, likedBy: req.user?._id });
    console.log('Existing like:', existing); // Debug log

    let isLiked;

    if (existing) {
        await Like.findOneAndDelete({ video: videoId, likedBy: req.user?._id });
        isLiked = false;
        // Update video likes count
        await Video.findByIdAndUpdate(videoId, { $inc: { likes: -1 } });
    } else {
        await Like.create({ video: videoId, likedBy: req.user?._id });
        isLiked = true;
        // Update video likes count
        await Video.findByIdAndUpdate(videoId, { $inc: { likes: 1 } });
    }

    console.log('Like toggled:', isLiked); // Debug log

    return res.status(200).json(
        new ApiResponse(200, { isLiked }, `Video ${isLiked ? "liked" : "unliked"} successfully`)
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existing = await Like.findOne({ comment: commentId, likedBy: req.user?._id });

    let isLiked;

    if (existing) {
        await Like.findOneAndDelete({ comment: commentId, likedBy: req.user?._id });
        isLiked = false;
    } else {
        await Like.create({ comment: commentId, likedBy: req.user?._id });
        isLiked = true;
    }

    return res.status(200).json(
        new ApiResponse(200, { isLiked }, `Comment ${isLiked ? "liked" : "unliked"} successfully`)
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existing = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id });

    let isLiked;

    if (existing) {
        await Like.findOneAndDelete({ tweet: tweetId, likedBy: req.user?._id });
        isLiked = false;
        // Update tweet likes count
        await Tweet.findByIdAndUpdate(tweetId, { $inc: { likes: -1 } });
    } else {
        await Like.create({ tweet: tweetId, likedBy: req.user?._id });
        isLiked = true;
        // Update tweet likes count
        await Tweet.findByIdAndUpdate(tweetId, { $inc: { likes: 1 } });
    }

    return res.status(200).json(
        new ApiResponse(200, { isLiked }, `Tweet ${isLiked ? "liked" : "unliked"} successfully`)
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
        .populate("video", "title thumbnail views createdAt")
        .exec();

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
};