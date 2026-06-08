import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDKEY,
    api_secret: process.env.CLOUDPASSWORD
});

export default cloudinary