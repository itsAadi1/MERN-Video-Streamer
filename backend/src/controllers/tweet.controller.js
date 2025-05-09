import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Like} from "../models/like.model.js"

const getTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.find()
        .populate("owner", "fullName username avatar")
        .sort("-createdAt");

    // Get likes for each tweet
    const tweetsWithLikes = await Promise.all(tweets.map(async (tweet) => {
        const isLiked = await Like.findOne({ 
            tweet: tweet._id, 
            likedBy: req.user?._id 
        });
        return {
            ...tweet.toObject(),
            isLiked: !!isLiked
        };
    }));

    return res.status(200).json(
        new ApiResponse(200, tweetsWithLikes, "Tweets fetched successfully")
    );
});

const createTweet = asyncHandler(async (req, res) => {
    try {
        console.log('Create Tweet - Request body:', req.body);
        console.log('Create Tweet - User:', req.user);
        
        if (!req.user) {
            console.error('Create Tweet - No user found in request');
            throw new ApiError(401, "User not authenticated");
        }

        const { content } = req.body;

        if (!content.trim()) {
            console.error('Create Tweet - No content provided');
            throw new ApiError(400, "Content is required");
        }

        console.log('Create Tweet - Creating tweet with:', {
            content,
            owner: req.user._id
        });

        const tweet = await Tweet.create({
            content,
            owner: req.user._id
        });

        console.log('Create Tweet - Tweet created:', tweet);

        const populatedTweet = await Tweet.findById(tweet._id)
            .populate("owner", "fullName username avatar");

        console.log('Create Tweet - Populated tweet:', populatedTweet);

        return res.status(201).json(
            new ApiResponse(201, populatedTweet, "Tweet created successfully")
        );
    } catch (error) {
        console.error('Create Tweet - Error:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, error?.message || "Something went wrong while creating tweet");
    }
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.find({ owner: userId })
        .populate("owner", "fullName username avatar")
        .sort("-createdAt");

    return res.status(200).json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user._id
        },
        {
            $set: {
                content
            }
        },
        { new: true }
    ).populate("owner", "fullName username avatar");

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user._id
    });

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getTweets
}
