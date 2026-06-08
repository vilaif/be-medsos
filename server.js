import 'dotenv/config'
import express from 'express'
import AuthRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import followRouter from './routes/follow.route.js'
import FeedRouter from './routes/feed.route.js'
import commentRouter from './routes/comment.route.js'
import likeRouter from './routes/like.route.js'
import BookmarkRouter from './routes/bookmark.route.js'
import cors from 'cors'

const app = express()
const port = 3000

app.use(express.json()); //baris ini berfungsi untuk membaca inputan request berupa json
app.use(cors()); // baris ini merupakan middleware agar frontend bisa mengakses entri poin API dari backend ini

app.use('/api/auth', AuthRouter);
app.use('/api/user', userRouter);
app.use('/api/follow', followRouter);
app.use('/api/feed', FeedRouter);
app.use('/api/comment', commentRouter);
app.use('/api/like', likeRouter);
app.use('/api/bookmark', BookmarkRouter);

app.listen(port, () => {
    console.log(`Aplikasi server jalan di port ${port}`)
})