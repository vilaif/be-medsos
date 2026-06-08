import express from 'express'
import { AuthMiddleware } from '../middleware/auth.middleware.js'
import { CheckLikeUser, LikeFeedUser } from '../controller/like.controller.js'

const likeRouter = express.Router()

likeRouter.post('/:postId', AuthMiddleware, LikeFeedUser)
likeRouter.get('/:postId', AuthMiddleware, CheckLikeUser)

export default likeRouter 