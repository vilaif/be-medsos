import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js'
import { decode } from 'node:punycode';

export const AuthMiddleware = async (req, res, next) => { // parameter 'next' gunanya untuk beralih ke fungsi atau controller selanjutnya
    const JWTSECRET = process.env.JWTSECRET

    try {
        const headers = req.headers.authorization

        if (!headers) {
            return res.status(401).json({
                message: "Authorization Error, token belum diinput"
            })
        }

        // index 0 = menampung bearer
        // index 1 = menampung token yang kita inputkan (misal: hasdonasdfjhawnajs). Index ini yang diambil sebagai token

        const token = headers.split("Bearer ")[1]
        const decoded = jwt.verify(token, JWTSECRET)

        const currentUser = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        })

        req.user = {
            id: currentUser.id,
            fullname: currentUser.fullname,
            username: currentUser.username,
            email: currentUser.email,
            image: currentUser.image,
            bio: currentUser.bio
        }

        next()

    } catch (error) {
        return res.status(500).json({
            message: "Server Down"
        })
    }
}