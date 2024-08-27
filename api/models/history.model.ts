import mongoose, { Model, ObjectId, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export type IHistory = {
    searchText: string,
    type: string,
    userId: ObjectId,
    videoId: ObjectId,
    createdAt: NativeDate,
    updatedAt: NativeDate,
}

export interface historyModel extends Model<IHistory, {}> {
    aggregatePaginate: any,
}

const historySchema = new Schema<IHistory>(
    {
        searchText: {
            type: String
        },
        type: {
            type: String,
            enum: ['watch', 'search'],
            required: [true, 'Type is required']
        },
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'User id is required']
        },
        videoId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Video'
        }
    },
    {
        timestamps: true
    }
);

// Add Pagination plugin
historySchema.plugin(mongooseAggregatePaginate)

const History = mongoose.model<IHistory, historyModel>("History", historySchema);

export default History;