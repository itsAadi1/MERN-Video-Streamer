import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const cloudinaryDelete = async (fileToDelete, resourceType = "image") => {
    try {
        const result = await cloudinary.uploader.destroy(fileToDelete, {
            resource_type: resourceType, // Dynamically set the resource type
        });
        console.log("File deleted successfully:", result);
        return result;
    } catch (error) {
        console.error("Error deleting the file:", error);
        throw error; // Re-throw the error for proper error handling
    }
};

export {uploadOnCloudinary,cloudinaryDelete}

