import prisma from "../utils/prisma.js"
import cloudinary from "../utils/cloudinary.js"

export const CreateFeed = async (req, res) => {
    try {
        const { caption } = req.body
        const currentUserId = req.user.id

        // Validation
        if (!caption) {
            return res.status(400).json({ message: "Caption harus diisi" })
        }

        if (!req.file) {
            return res.status(400).json({ message: "File gambar belum diisi" })
        }

        // upload gambar dengan buffer multer (jika tidak ada gambarnya)
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`

        const result = await cloudinary.uploader.upload(fileStr, {
            folder: 'feeds',
            transformation: [
                { aspect_ratio: "4:5", crop: "fill", gravity: "auto" },
                { quality: "auto", fetch_format: "auto" }
            ]
        })

        // Buat postingan feed baru
        const newFeed = await prisma.post.create({
            data: {
                caption,
                image: result.secure_url,
                imageId: result.public_id,
                userId: currentUserId
            }
        })

        // Update data user
        await prisma.user.update({
            where: {
                id: Number(currentUserId)
            },
            data: {
                postCount: { increment: 1 }
            }
        })

        // Response
        res.status(201).json({
            message: "Feed berhasil dibuat",
            data: newFeed
        })

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            message: "Server Down",
            error
        })
    }
}

export const ReadAllFeed = async (req, res) => {
    try {
        const currentUserId = req.user.id

        const followings = await prisma.follow.findMany({
            where: { followingId: currentUserId },
            select: { followerId: true }
        })

        // Mapping followerId dari followings
        const followingIdS = followings.map(f => f.followerId)

        // Query request
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 3
        const skip = (page - 1) * limit

        const totalFeed = await prisma.post.count({
            where: {
                userId: { in: [...followingIdS, currentUserId] }
            }
        })

        const post = await prisma.post.findMany(
            {
                where: {
                    userId: { in: [...followingIdS, currentUserId] }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            username: true,
                            image: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: skip,
                take: limit
            }
        )

        const totalPages = Math.ceil(totalFeed / limit)

        res.status(200).json({
            page,
            limit,
            totalPages,
            totalFeed,
            data: post
        })

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            message: "Server Down",
            error
        })
    }
}

export const detailFeed = async (req, res) => {
    const { id } = req.params

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullname: true,
                        username: true,
                        image: true
                    }
                },
                comments: {
                    select: {
                        content: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                fullname: true,
                                username: true,
                                image: true,
                                createdAt: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!post) {
            return res.status(404).json({
                message: "Post tidak ditemukan"
            })
        }

        res.status(200).json({
            message: "Get detail feed",
            data: post
        })

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            message: "Server Down",
            error
        })
    }
}

export const deleteFeed = async (req, res) => {
    const { id } = req.params

    try {
        const postData = await prisma.post.findUnique({
            where: {
                id: Number(id)
            }
        })

        if (!postData) {
            return res.status(404).json({
                message: "Feeds tidak ditemukan"
            })
        }

        // Apakah user id yang ingin menghapus postingan sama dengan user id yang membuat postingan
        if (postData.userId != req.user.id) {
            return res.status(400).json({
                message: "Anda tidak bisa menghapus feed user lain"
            })
        }

        // Kondisi ketika menghapus gambar postingan di cloudinary
        if (postData.imageId) {
            await cloudinary.uploader.destroy(postData.imageId)
        }

        // Hapus data postingan
        await prisma.post.delete({
            where: {
                id: Number(id)
            }
        })

        res.status(200).json({
            message: 'Data feeds berhasil dihapus'
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server Down',
            error
        })
    }
}