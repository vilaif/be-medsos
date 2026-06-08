import express from 'express';
import { followUserAccount, unfollowUserAccount, getLimitUser, isFollowUser } from '../controller/follow.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const followRouter = express.Router();

followRouter.post('/', AuthMiddleware, followUserAccount)
followRouter.delete('/:unfollowUserId', AuthMiddleware, unfollowUserAccount)
followRouter.get('/user', AuthMiddleware, getLimitUser)
followRouter.get('/:followUserId', AuthMiddleware, isFollowUser)


export default followRouter