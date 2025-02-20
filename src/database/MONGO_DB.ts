import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";

;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/baat_cheet`);
        console.log('connection successfull');
    } catch (error) {
        console.log(error)
    }
})()

const UsersSchema = new mongoose.Schema({
    userName : String,
    email : String,
    Password : String
})

let User;
export default User = mongoose.model('users',UsersSchema);