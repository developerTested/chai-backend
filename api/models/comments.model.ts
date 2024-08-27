import mongoose, { Model, ObjectId, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

type commentType = {
    content: string,
    videoId: ObjectId,
    userId: ObjectId,
    createdAt: NativeDate,
    updatedAt: NativeDate,
}

export interface commentTypeModel extends Model<commentType, {}> {
    aggregatePaginate: any,
}

const commentsSchema = new Schema<commentType>(
    {
        content: {
            type: String,
            required: true,
        },
        videoId: {
            type: mongoose.Schema.ObjectId,
            ref: "Video",
            required: [true, "Video id is required"],
        },
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "User id is required"],
        },
    },
    {
        timestamps: true
    }
);

// Add Pagination plugin
commentsSchema.plugin(mongooseAggregatePaginate)

const Comment = mongoose.model<commentType, commentTypeModel>("Comment", commentsSchema);

export default Comment;