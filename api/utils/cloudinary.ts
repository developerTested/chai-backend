import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import path from 'path';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadToCloudinary(localFilePath: string) {

    if (!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })

        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        console.log(error);

        fs.unlinkSync(localFilePath);

        return null;
    }
}

export async function deleteFileFromCloudinary(fileUrl: string, fileType: "image" | "raw" | "video" = "image") {

    if (!fileUrl) return null;

    const getFileName = path.parse(fileUrl).name;
    
    try {
        const response = await cloudinary.api.delete_resources([getFileName], {
            type: 'upload',
            resource_type: fileType,
        })

        return response;

    } catch (error) {
        console.log(error);

        return null;
    }

}