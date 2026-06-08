import express from 'express'
import { getSearchUser, getUsernameByUsername, updateAvatar, updateUser } from '../controller/user.controller.js'
import { AuthMiddleware } from '../middleware/auth.middleware.js'
import upload from '../middleware/upload.middleware.js'

const userRouter = express.Router()

userRouter.get('/search', getSearchUser)
userRouter.get('/:username', getUsernameByUsername)
userRouter.put('/update-user', AuthMiddleware, updateUser)
userRouter.put('/update-photo-profile', AuthMiddleware, upload.single('image'), updateAvatar)

export default userRouter