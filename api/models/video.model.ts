import mongoose, { InferSchemaType, Model, ObjectId, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export type IVideo = {
    _id: string,
    videoFile: string,
    thumbnail: string,
    title: string,
    description: string,
    duration: number,
    views: number,
    isPublished: boolean,
    liveStream: boolean,
    scheduledAt: NativeDate,
    channelId: ObjectId,
    createdAt: NativeDate,
    updatedAt: NativeDate,
}

export interface VideoModel extends Model<IVideo, {}> {
    aggregatePaginate: any,
}

const videoSchema = new Schema<IVideo>(
    {
        videoFile: {
            type: String,
            required: [true, "Video File is required"],
        },
        thumbnail: {
            type: String,
            required: [true, "Thumbnail is required"],
        },
        title: {
            type: String,
            text: true,
            required: [true, "Title is required"],
        },
        description: {
            type: String,
            text: true,
            required: [true, "Description is required"],
        },
        duration: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        liveStream: {
            type: Boolean,
            default: false,
        },
        scheduledAt: {
            type: Date,
            default: null,
        },
        channelId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, 'Channel id is required']
        },
    },
    {
        timestamps: true
    }
);

// Add Pagination plugin
videoSchema.plugin(mongooseAggregatePaginate)

const Video = mongoose.model<IVideo, VideoModel>("Video", videoSchema);

export default Video;