import prisma from "../utils/prisma.js"

export const followUserAccount = async (req, res) => {
    // inputan current user inputan follow user

    const currentUserId = req.user.id

    const { followUserId } = req.body

    // check jika current userId sama dengan followerUserId
    if (currentUserId === followUserId) {
        return res.status(400).json({
            message: "Tidak bisa follow akun sendiri"
        })
    }

    const otherUserId = await prisma.user.findUnique({
        where: {
            id: Number(followUserId)
        }
    })

    if (!otherUserId) {
        return res.status(400).json({
            message: "User id tidak ditemukan"
        })
    }

    // untuk check apakah currentUserId sudah follow user id lain tersebut
    const isFollowUser = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: Number(followUserId),
                followingId: Number(currentUserId)
            }
        }
    })

    if (isFollowUser) {
        return res.status(400).json({
            message: "user sudah pernah di follow"
        })
    }

    // input data ke database
    try {
        const follow = await prisma.follow.create({
            data: {
                followerId: followUserId,
                followingId: currentUserId
            }
        })

        // update user follow count
        await prisma.user.update({
            where: {
                id: currentUserId
            },
            data: {
                followingCount: {
                    increment: 1
                }
            }
        })

        await prisma.user.update({
            where: {
                id: followUserId
            },
            data: {
                followerCount: {
                    increment: 1
                }
            }
        })

        res.status(201).json({
            message: "Follow user berhasil",
            data: follow
        })
    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: "Server down",
            error
        })
    }
}

export const unfollowUserAccount = async (req, res) => {
    const { unfollowUserId } = req.params
    const currentUserId = req.user.id

    const userUnfollow = await prisma.user.findUnique({
        where: {
            id: Number(unfollowUserId)
        }
    })

    if (!userUnfollow) {
        return res.status(404).json({
            message: "User tidak ditemukan"
        })
    }

    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: Number(unfollowUserId),
                    followingId: Number(currentUserId)
                }
            }
        })

        // update count user following dan follower
        await prisma.user.update({
            where: {
                id: currentUserId
            },
            data: {
                followingCount: {
                    decrement: 1
                }
            }
        })

        await prisma.user.update({
            where: {
                id: Number(unfollowUserId)
            },
            data: {
                followerCount: {
                    decrement: 1
                }
            }
        })

        res.status(200).json({
            message: "User berhasil di unfollow"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Server down",
            error
        })
    }
}

export const getLimitUser = async (req, res) => {
    try {
        const currentUserId = req.user.id

        const followedUser = await prisma.follow.findMany({
            where: { followingId: currentUserId },
            select: { followerId: true }
        })

        // variabel untuk mapping total user yang diikuti oleh current User
        const followedIds = followedUser.map(f => f.followerId)

        // untuk menampilkan users yang tidak di follow oleh current user
        const users = await prisma.user.findMany({
            where: {
                id: {
                    notIn: [...followedIds, currentUserId]
                }
            },
            select: {
                id: true,
                image: true,
                fullname: true,
                username: true
            },
            take: 5,
            orderBy: {
                createdAt: 'desc'
            }
        })

        res.status(200).json({
            message: "5 User yang belum di follow",
            data: users
        })

    } catch (error) {
        res.status(500).json({
            message: "Server Down",
            error
        })
    }
}

export const isFollowUser = async (req, res) => {
    try {
        const currentUserId = req.user.id
        const { followUserId } = req.params

        const checkFollowUserId = await prisma.user.findUnique({
            where: {
                id: Number(followUserId)
            }
        })

        if (!checkFollowUserId) {
            return res.status(404).json({
                message: 'User tidak ditemukan'
            })
        }

        // check user sudah follow follower user
        const isFollowUserData = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: Number(followUserId),
                    followingId: currentUserId
                }
            }
        })

        if (isFollowUserData) {
            return res.status(201).json({
                data: true
            })
        }

        return res.status(200).json({
            data: false
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server Down',
            error
        })
    }
}