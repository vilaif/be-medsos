import express from 'express'
import { AuthMiddleware } from '../middleware/auth.middleware.js'
import { createComment, deleteCommentById } from '../controller/comment.controller.js'


const commentRouter = express.Router()

commentRouter.post('/', AuthMiddleware, createComment)
commentRouter.delete('/:id', AuthMiddleware, deleteCommentById)

export default commentRouter