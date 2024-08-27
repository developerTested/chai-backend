const tweetPipeline = [
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
            foreignField: "tweetId",
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
        $project: {
            content: 1,
            channel: {
                _id: 1,
                username: 1,
                fullName: 1,
                avatar: 1,
                verified: 1,
            },
            stats: 1,
            createdAt: 1,
            updatedAt: 1,
        }
    }
]

export default tweetPipeline;