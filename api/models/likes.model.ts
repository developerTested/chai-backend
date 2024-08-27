import mongoose, { ObjectId, Schema, Model } from "mongoose";

export type likeType = {
    type: string,
    commentId: ObjectId,
    videoId: ObjectId,
    tweetId: ObjectId,
    userId: ObjectId,
}

export type likeTypeModel = Model<likeType, {}>;

const likeSchema = new Schema<likeType, likeTypeModel>(
    {
        type: {
            type: String,
            enum: ['like', 'dislike'],
            required: [true, 'Type is required']
        },
        commentId: {
            type: mongoose.Schema.ObjectId,
            ref: "Comment",
        },
        videoId: {
            type: mongoose.Schema.ObjectId,
            ref: "Video",
        },
        tweetId: {
            type: mongoose.Schema.ObjectId,
            ref: "Tweet",
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

const Like = mongoose.model("Like", likeSchema);

export default Like;