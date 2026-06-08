import prisma from "../utils/prisma.js"

export const toogleSavedFeed = async (req, res) => {
    const { postId } = req.params
    const currentUserId = req.user.id

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

        const checkUserBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_postId: {
                    userId: currentUserId,
                    postId: Number(postId)
                }
            }
        })

        if (checkUserBookmark) {
            // Delete Bookmark
            await prisma.bookmark.delete({
                where: {
                    userId_postId: {
                        userId: currentUserId,
                        postId: Number(postId)
                    }
                }
            })

            return res.status(200).json({
                message: 'Berhasil unsave Feed/post'
            })
        }

        // Create Bookmark
        const newBookmark = await prisma.bookmark.create({
            data: {
                userId: currentUserId,
                postId: Number(postId)
            }
        })

        return res.status(201).json({
            message: 'Berhasil save Feed/Post',
            data: newBookmark
        })

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            message: 'Server Down',
            error
        })
    }
}

export const CheckSavedFeed = async (req, res) => {
    try {
        const { postId } = req.params
        const currentUserId = req.user.id

        const checkSaved = await prisma.bookmark.findUnique({
            where: {
                userId_postId: {
                    userId: currentUserId,
                    postId: Number(postId)
                }
            }
        })

        if (checkSaved) {
            res.status(200).json({ data: true })
        }

        return res.status(201).json({ data: false })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server Down',
            error
        })
    }
}