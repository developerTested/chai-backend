import mongoose, { Model, ObjectId, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

type IPlaylist = {
    name: string,
    description: string,
    videos: [],
    channelId: ObjectId,
    createdAt: NativeDate,
    updatedAt: NativeDate,
}

export interface PlayListModel extends Model<IPlaylist, {}> {
    aggregatePaginate: any,
}

const playListSchema = new Schema<IPlaylist>(
    {
        name: {
            type: String,
            required: [true, "Playlist Name is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        videos: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Video"
            }
        ],
        channelId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "User Id is required"],
        },
    },
    {
        timestamps: true
    }
);

// Add Pagination plugin
playListSchema.plugin(mongooseAggregatePaginate)

const PlayList = mongoose.model<IPlaylist, PlayListModel>("PlayList", playListSchema);

export default PlayList;