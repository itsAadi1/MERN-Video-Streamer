import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;
    console.log(subscriberId);
    
    const existing = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });
    let toggled;
    if (existing) {
        toggled=await Subscription.findOneAndDelete({ subscriber: subscriberId, channel: channelId });
        return res.status(200).json(new ApiResponse(201,toggled,"unsubscibed"));
    } else {
        toggled=await Subscription.create({ subscriber: subscriberId, channel: channelId });
        return res.status(200).json(new ApiResponse(201,toggled,"subscribed"));
    }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Validate subscriberId as a valid ObjectId
    if (!mongoose.isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    console.log(`Fetching subscribers for channel: ${subscriberId}`);
    
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(subscriberId), // Ensure proper ObjectId type
            },
        },
        {
            $lookup: {
                from: "users", // MongoDB collection name
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberInfo",
            },
        },
        {
            $unwind: "$subscriberInfo",
        },
        {
            $replaceRoot: { newRoot: "$subscriberInfo" },
        },
    ]);

    if (!subscribers.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "No subscribers found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    console.log(req.user.fullName);
    
    const subscribedChannels = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedBy",
            },
        },
        {
            $unwind: "$subscribedBy",
        },
        {
            $lookup: {
                from: "users",
                localField: "subscribedBy.channel",
                foreignField: "_id",
                as: "subscribedTo",
            },
        },
        {
            $project: {
                subscribedBy: 1,
                subscribedTo: 1,
            },
        },
    ]);

    if (!subscribedChannels?.length) {
        throw new ApiError(404, "User doesn't exist or has no subscriptions");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
