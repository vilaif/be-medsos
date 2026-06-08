import prisma from "../utils/prisma.js"

export const LikeFeedUser = async (req, res) => {
    // Request
    const currentUserId = req.user.id
    const { postId } = req.params

    try {
        // Validation
        const postData = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        })

        if (!postData) {
            return res.status(404).json({
                message: 'Post/Feed tidak ditemukan'
            })
        }

        // Check jika user sudah menLike post tersebut
        const CheckLike = await prisma.likes.findUnique({
            where: {
                userId_postId: {
                    userId: currentUserId,
                    postId: Number(postId)
                }
            }
        })

        if (CheckLike) {
            return res.status(400).json({
                message: 'Post sudah pernah anda like'
            })
        }

        // Insert data like
        const newLike = await prisma.likes.create({
            data: {
                userId: currentUserId,
                postId: Number(postId)
            }
        })

        // Update data post
        await prisma.post.update({
            where: { id: Number(postId) },
            data: {
                likeCount: { increment: 1 }
            }
        })

        res.status(201).json({
            message: "Berhasil like feed",
            data: newLike
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server Down'
        })
    }
}

export const CheckLikeUser = async (req, res) => {
    const currentUserId = req.user.id
    const { postId } = req.params

    try {
        const postData = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        })

        if (!postData) {
            return res.status(404).json({
                message: 'Post/Feed tidak ditemukan'
            })
        }

        const checkLike = await prisma.likes.findUnique({
            where: {
                userId_postId: {
                    userId: currentUserId,
                    postId: Number(postId)
                }
            }
        })

        if (checkLike) {
            await prisma.likes.delete({
                where: {
                    userId_postId: {
                        userId: currentUserId,
                        postId: Number(postId)
                    }
                }
            })

            await prisma.post.update({
                where: { id: Number(postId) },
                data: {
                    likeCount: { decrement: 1 }
                }
            })

            return res.status(200).json({
                message: 'Unlike post berhasil'
            })
        }

        res.status(201).json({
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