import express from 'express'
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { CheckSavedFeed, toogleSavedFeed } from '../controller/bookmark.controller.js';

const BookmarkRouter = express.Router();

BookmarkRouter.post('/:postId', AuthMiddleware, toogleSavedFeed)
BookmarkRouter.get('/:postId', AuthMiddleware, CheckSavedFeed)

export default BookmarkRouter