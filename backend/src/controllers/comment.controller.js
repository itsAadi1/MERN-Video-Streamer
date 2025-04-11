import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "fullName username avatar")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)

    const total = await Comment.countDocuments({ video: videoId })

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            },
            "Comments fetched successfully"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    const populatedComment = await Comment.findById(comment._id)
        .populate("owner", "fullName username avatar")

    return res.status(201).json(
        new ApiResponse(201, populatedComment, "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id
        },
        {
            $set: {
                content
            }
        },
        {new: true}
    ).populate("owner", "fullName username avatar")

    if (!comment) {
        throw new ApiError(404, "Comment not found or unauthorized")
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    })

    if (!comment) {
        throw new ApiError(404, "Comment not found or unauthorized")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
