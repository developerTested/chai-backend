const userPipeline = [
    {
        $project: {
            _id: 1,
            fullName: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            verified: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
        }
    }
]

export default userPipeline;