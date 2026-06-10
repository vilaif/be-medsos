import * as z from "zod";
import prisma from "../utils/prisma.js"
import { error } from "node:console";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const RegisterUser = async (req, res) => {
    try {

        // Validation
        const userSchema = z.object({
            fullname: z.string().min(6, "Fullname minimal 6 karakter"),
            username: z.string().min(6, "Username minimal 6 karakter"),
            email: z.email("Email harus berformat email: example@mail.com"),
            password: z.string().min(8, "password minimal 8 karakter")
        })

        const validated = userSchema.parse(req.body) // parse atau memasukkan semua object userSchema kedalam variable "validated"

        // check apakah email dan username sudah terdaftar di database
        const emailExisting = await prisma.user.findUnique({
            where: {
                email: validated.email
            }
        })

        if (emailExisting) {
            return res.status(400).json({ message: "Email sudah terdaftar, silahkan gunakan email lain" })
        }

        const usernameExisting = await prisma.user.findUnique({
            where: {
                username: validated.username
            }
        })

        if (usernameExisting) {
            return res.status(400).json({ message: "Username sudah terdaftar, silahkan gunakan username lain" })
        }

        // Enkripsi password
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(validated.password, salt)

        // insert ke database
        const newUser = await prisma.user.create({
            data: {
                fullname: validated.fullname,
                username: validated.username,
                password: hashedPassword,
                email: validated.email
            }
        })

        const jwtSecret = process.env.JWTSECRET
        const token = jwt.sign({ id: newUser.id }, jwtSecret, { expiresIn: '6d' });

        return res.status(201).json({
            message: "register berhasil",
            data: {
                id: newUser.id,
                fullname: newUser.fullname,
                username: newUser.username,
                email: newUser.email,
                image: newUser.image,
                bio: newUser.bio
            },
            token: token
        })

    } catch (err) {
        if (err instanceof Error && 'issues' in err) {
            // zod
            const errors = err.issues.map((i) => i.message)
            return res.status(400).json({
                message: errors
            })

            // jika express.js error
            console.log(err);
            res.status(500).json({ message: "Server Down" })
        }

    }
}

export const LoginUser = async (req, res) => {
    try {
        // validation email dan password
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Email dan Password harus diisi"
            })
        }

        const existingEmail = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!existingEmail) {
            return res.status(400).json({
                message: "Email tidak terdaftar, silahkan lakukan register"
            })
        }

        // bandingkan password req body dengan password database encrypt
        const comparePassword = bcrypt.compareSync(password, existingEmail.password)

        if (!comparePassword) {
            return res.status(400).json({
                message: "Invalid User"
            })
        }

        // buat jwt simpan id user ke jwt
        const jwtSecret = process.env.JWTSECRET
        const token = jwt.sign({ id: existingEmail.id }, jwtSecret, { expiresIn: '6d' });

        // res success
        return res.status(201).json({
            message: "Login berhasil",
            data: {
                id: existingEmail.id,
                fullname: existingEmail.fullname,
                username: existingEmail.username,
                email: existingEmail.email,
                image: existingEmail.image,
                bio: existingEmail.bio
            },
            token: token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Down" })
    }
}

export const GetUser = async (req, res) => {
    res.status(200).json({
        message: "Berhasil get user",
        data: req.user
    })
}
