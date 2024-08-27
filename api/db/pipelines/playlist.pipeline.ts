import videoPipeline from "./video.pipeline"

const playlistPipeline = [
    {
        $lookup: {
            from: "users",
            localField: "channelId",
            foreignField: "_id",
            as: "channel"
        }
    },
    {
        $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
            pipeline: videoPipeline
        }
    },
    {
        $unwind: {
            path: "$channel",
        }
    },
    {
        $project: {
            _id: 1,
            name: 1,
            description: 1,
            channel: {
                _id: 1,
                username: 1,
                fullName: 1,
                avatar: 1,
                verified: 1,
            },
            videos: 1,
        }
    }
]


export const channelPlaylistPipeline = [
    {
        $lookup: {
            from: "playlists",
            localField: "_id",
            foreignField: "channelId",
            as: "playlist",
            pipeline: playlistPipeline,
        }
    },
    {
        $project: {
            _id: 1,
            fullName: 1,
            username: 1,
            avatar: 1,
            coverImage: 1,
            playlist: 1
        }
    }
]


export default playlistPipeline