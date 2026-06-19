import prisma from "../utils/prisma.js"
import * as z from "zod";
import cloudinary from "../utils/cloudinary.js";

export const getUsernameByUsername = async (req, res) => {
    const { username } = req.params

    try {
        const user = await prisma.user.findUnique({
            where: {
                username
            },
            omit: {
                password: true,
                imageId: true
            },
            include: {
                posts: {
                    omit: {
                        userId: true,
                        imageId: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                bookmarks: {
                    include: {
                        post: {
                            omit: {
                                userId: true,
                                imageId: true
                            }
                        }
                    }
                }
            }
        })

        if (!user) {
            return res.status(400).json({ message: "Username tidak ditemukan" })
        }

        res.status(200).json({
            message: "Detail User",
            data: user
        })

    } catch (error) {
        return res.status(500).json({ message: "Server Down" })
    }
}

export const getSearchUser = async (req, res) => {
    const { username } = req.query

    if (!username) {
        return res.status(400).json({ message: "Parameter query belum diisi" })
    }

    const users = await prisma.user.findMany({
        where: {
            username: {
                contains: username,
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            username: true,
            fullname: true,
            image: true
        }
    })

    if (users.length === 0) { // tidak menemukan username
        return res.status(404).json({ message: "User tidak ditemukan." })
    }

    res.status(200).json({
        message: "Searching User",
        data: users
    })
}

export const updateUser = async (req, res) => {

    try {
        // Validation dengan zod
        const userSchema = z.object({
            fullname: z.string().min(6, "Fullname minimal 6 karakter"),
            username: z.string().min(6, "Username minimal 6 karakter"),
            bio: z.string().min(6, "Biodata minimal 10 karakter")
        })

        const validated = userSchema.parse(req.body)

        // Validation dengan username
        const currentUser = await prisma.user.findUnique({
            where: {
                username: validated.username
            }
        })

        if (currentUser && currentUser.id !== req.user.id) {
            return res.status(400).json({
                message: "Username sudah digunakan, silahkan gunakan username lain"
            })
        }

        // Update User berdasarkan User ID
        const updateUser = await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                bio: validated.bio,
                username: validated.username,
                fullname: validated.fullname
            },
            omit: {
                password: true
            }
        })

        // Response Success
        res.status(201).json({
            message: "Update user berhasil",
            data: updateUser
        })

    } catch (err) {
        if (err instanceof Error && 'issues' in err) {
            // zod
            const errors = err.issues.map((i) => i.message)
            return res.status(400).json({ message: errors })

            // jika express.js error
            console.log(err)
            res.status(500).json({ message: "Server Down" })
        }
    }

}

export const updateAvatar = async (req, res) => {
    try {
        // validation file
        if (!req.file) {
            return res.status(400).json({
                message: "Belum ada gambar yang diinput"
            })
        }

        // get current dari req user id
        const currentUser = await prisma.user.findUnique({
            where: {
                id: req.user.id
            }
        })

        // validasi 2 kita buat fungsi untuk hapus gambar lama
        if (currentUser.imageId) {
            await cloudinary.uploader.destroy(currentUser.imageId)
        }

        // upload gambar dengan buffer multer (jika tidak ada gambarnya)
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`

        const result = await cloudinary.uploader.upload(fileStr, {
            folder: 'avatar',
            transformation: [{
                width: 300,
                height: 300
            }]
        })

        // update user image dan imageId di database table user
        const updateUser = await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                image: result.secure_url,
                imageId: result.public_id
            },
            omit: {
                password: true
            }
        })

        // res success    
        res.status(201).json({
            message: "Update photo profile berhasil",
            data: updateUser
        })

    } catch (error) {
        return res.status(500).json({
            message: "Server Down",
            error
        })
    }


}