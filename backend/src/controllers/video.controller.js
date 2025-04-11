import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {cloudinaryDelete, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filter = {};

    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }

    if (userId && mongoose.isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const sortOption = {};
    sortOption[sortBy] = sortType === "asc" ? 1 : -1;

    console.log('Fetching videos with filter:', filter); // Debug log

    const videos = await Video.find(filter)
        .populate('owner', 'fullName username avatar') // Populate owner details
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    console.log('Found videos:', videos); // Debug log

    const total = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, { videos, total }, "Videos fetched successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath=req.files?.videoFile[0].path
    const thumbnailLocalPath=req.files?.thumbnail[0].path
    if(!videoLocalPath) throw new ApiError(401,"video file is missing")
    if(!thumbnailLocalPath) throw new ApiError(401,"thumbnail not found")
    const video=await uploadOnCloudinary(videoLocalPath)
    if(!video) throw new ApiError(401,"error uploading videos")
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail) throw new ApiError(401,"error uploading thumbnail")

    const newVideo=await Video.create({
        videoFile:video.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration:video.duration,
        views:0,
        isPublished:true,
        owner:req.user?._id
    })
    if(!newVideo._id) throw new ApiError(401,"error while publishing video")  
    return res.status(200).json(new ApiResponse(200,newVideo,"video published successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video=await Video.findById(videoId)
    if(!video) throw new ApiError(401,"video not found")
    return res.status(200).json(new ApiResponse(200,video,"video fetched successfuly"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // Validate videoId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if a new thumbnail is being uploaded
    let thumbnailUrl;
    if (req.file) {
        const thumbnail = await uploadOnCloudinary(req.file.path);
        if (!thumbnail.url) {
            throw new ApiError(400, "Error while uploading thumbnail");
        }
        thumbnailUrl = thumbnail.url;
    }

    // Update the video
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                ...(title && { title }), // Update title if provided
                ...(description && { description }), // Update description if provided
                ...(thumbnailUrl && { thumbnail: thumbnailUrl }), // Update thumbnail if provided
            },
        },
        { new: true } // Return the updated document
    );

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Find the video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Helper function to extract publicId from a Cloudinary URL
    const getPublicIdFromUrl = (url) => {
        const parts = url.split('/'); // Split the URL by '/'
        const fileName = parts[parts.length - 1]; // Get the last part of the URL (e.g., 'sample.mp4')
        return fileName.split('.')[0]; // Remove the file extension (e.g., '.mp4') to get 'sample'
    };

    // Delete the video file from Cloudinary if it exists
    if (video.videoFile) {
        const videoPublicId = getPublicIdFromUrl(video.videoFile);
        try {
            console.log(videoPublicId);
            
            await cloudinaryDelete(videoPublicId,"video");
        } catch (error) {
            console.error('Error deleting video file from Cloudinary:', error);
            throw new ApiError(500, "Failed to delete video file from Cloudinary");
        }
    }

    // Delete the thumbnail from Cloudinary if it exists
    if (video.thumbnail) {
        const thumbnailPublicId = getPublicIdFromUrl(video.thumbnail);
        try {
            await cloudinaryDelete(thumbnailPublicId);
        } catch (error) {
            console.error('Error deleting thumbnail from Cloudinary:', error);
            throw new ApiError(500, "Failed to delete thumbnail from Cloudinary");
        }
    }

    // Delete the video document from the database
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Fetch the current video document
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // Toggle the isPublished field
    video.isPublished = !video.isPublished;

    // Save the updated video
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Successfully toggled publish status")
    );
});

const updateVideoViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video views updated successfully")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideoViews
}
