const commentPipeline = [
    {
        $lookup: {
            from: "videos",
            localField: "videoId",
            foreignField: "_id",
            as: "video"
        }
    }, 
    {
        $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "channel"
        }
    },
    {
        $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "commentId",
            pipeline: [
                {
                    $group: {
                        _id: null, // Group all documents together
                        like: { $sum: { $cond: { if: { $eq: ["$type", "like"] }, then: 1, else: 0 } } }, // Count likes
                        dislike: { $sum: { $cond: { if: { $eq: ["$type", "dislike"] }, then: 1, else: 0 } } } // Count dislikes
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude _id field
                        like: 1,
                        dislike: 1
                    }
                }
            ],
            as: "stats",
        },
    },
    {
        $addFields: {
            isOwner: {
                $cond: {
                    if: { $in: ["userId", "$video.channelId"] },
                    then: true,
                    else: false
                }
            }
        }
    },
    {
        $unwind: {
            path: "$stats",
            preserveNullAndEmptyArrays: true,
        }
    },
    {
        $unwind: {
            path: "$channel",
        }
    },
    {
        $addFields: {
            videoOwnerId: { $arrayElemAt: ["$video.channelId", 0] }
        }
    },
    {
        $project: {
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
            isOwner: { $eq: ["$videoOwnerId", "$channel._id"] },
            stats: 1,
            createdAt: 1,
            updatedAt: 1,
        }
    }
]

export default commentPipeline