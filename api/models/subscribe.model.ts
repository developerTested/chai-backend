import mongoose, { Model, ObjectId, Schema } from "mongoose";

export type SubscribeType = {
    subscriberId: ObjectId,
    channelId: ObjectId
}

export type SubscribeModel = Model<SubscribeType, {}>

const subscribeSchema = new Schema<SubscribeType, SubscribeModel>(
    {
        subscriberId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Subscriber is required"],
        },
        channelId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Channel is required"],
        },
    },
    {
        timestamps: true
    }
);

const Subscribe = mongoose.model("Subscribe", subscribeSchema);

export default Subscribe;