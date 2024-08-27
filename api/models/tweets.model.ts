import mongoose, { Model, ObjectId, Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

type TweetType = {
    content: string,
    userId: ObjectId,
    createdAt: NativeDate,
    updatedAt: NativeDate,
}

export interface tweetModelType extends Model<TweetType, {}> {
    aggregatePaginate: any,
}

const tweetSchema = new Schema<TweetType>(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "User id is required"],
        },
        content: {
            type: String,
            required: [true, "Content is required"],
        }
    },
    {
        timestamps: true,
    }
);

// Add Pagination plugin
tweetSchema.plugin(mongooseAggregatePaginate)

const Tweet = mongoose.model<TweetType, tweetModelType>("Tweet", tweetSchema);

export default Tweet;