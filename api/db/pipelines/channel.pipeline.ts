const channelPipeline = [
    {
        $lookup: {
            from: "users",
            localField: "channelId",
            foreignField: "_id",
            as: "channel",
            pipeline: [
                {
                    $lookup:
                    {
                        from: "subscribes",
                        localField: "_id",
                        foreignField: "channelId",
                        as: "subscribers",
                    }
                },
                {
                    $addFields: {
                        subscribers: {
                            $size: "$subscribers"
                        },
                    }
                },
            ],
        }
    },
];

export default channelPipeline;