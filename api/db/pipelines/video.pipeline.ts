import channelPipeline from "./channel.pipeline";

const videoPipeline = [
    ...channelPipeline,
    {
        $unwind: {
            path: "$channel",
        }
    },
    {
        $project: {
            title: 1,
            description: 1,
            videoFile: 1,
            thumbnail: 1,
            duration: 1,
            views: 1,
            isPublished: 1,
            liveStream: 1,
            scheduledAt: 1,
            stats: 1,
            channel: {
                _id: 1,
                username: 1,
                fullName: 1,
                avatar: 1,
                verified: 1,
                subscribers: 1,
            },
            comments: {
                _id: 1,
                content: 1,
                channel: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                    verified: 1,
                    subscribers: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            },
            createdAt: 1,
            updatedAt: 1,
        }
    }
];

export default videoPipeline;