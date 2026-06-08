import prisma from "../utils/prisma.js"

export const createComment = async (req, res) => {
    try {
        const currentUserId = req.user.id

        const { postId, content } = req.body

        // Validation 1
        if (!postId || !content) {
            res.status(400).json({
                message: 'Inputan post dan content harus diisi'
            })
        }

        // Validation 2
        const postData = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        })

        if (!postData) {
            return res.status(404).json({
                message: "Post/Feed tidak ditemukan"
            })
        }

        // Insert Data
        const newComment = await prisma.comment.create({
            data: {
                userId: Number(currentUserId),
                postId: Number(postId),
                content
            }
        })

        // Update Post Count
        await prisma.post.update({
            where: {
                id: Number(postId)
            },
            data: {
                commentCount: { increment: 1 }
            }
        })

        res.status(201).json({
            message: 'Comment Berhasil',
            data: newComment
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server Down',
            error
        })
    }
}

export const deleteCommentById = async (req, res) => {
    try {

        const { id } = req.params

        const currentUserId = req.user.id

        const comment = await prisma.comment.findUnique({
            where: {
                id: Number(id)
            }
        })

        if (!comment) {
            return res.status(404).json({
                message: 'Comment tidak ditemukan'
            })
        }

        if (comment.userId !== currentUserId) {
            res.status(400).json({
                message: 'Anda tidak bisa menghapus komentar user ini'
            })
        }

        await prisma.comment.delete({
            where: {
                id: Number(id)
            }
        })

        await prisma.post.update({
            where: {
                id: Number(comment.postId)
            },
            data: {
                commentCount: { decrement: 1 }
            }
        })

        res.status(200).json({
            message: 'Delete Comment berhasil'
        })

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            message: 'Server Down',
            error
        })
    }

}