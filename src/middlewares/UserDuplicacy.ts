import APIError from './../utils/APIError.js';
import User from './../database/MONGO_DB.js';
import { NextFunction, Request, Response } from 'express';

const UserDuplicacy = async (req: Request, res: Response, next: NextFunction) => {

    try {
        
        const username = req.body?.username;
        const email = req.body?.email;
    
        if(!username){
            res.json(new APIError(
                400,
                "Username required"
            ))
            return;
        }
    
        if(!email){
            res.json(new APIError(
                400,
                "Email required"
            ))
            return;
        }
    
        const user = await User.findOne({
            userName : username
        });
    
        const user1 = await User.findOne({
            email : email
        })
    
        const user2 = await User.findOne({
            userName : username,
            email : email
        })
    
        if(user2){
            res.json(new APIError(
                409,
                "User exists"
            ))
            return;
        }
        else if(user){
            res.json(new APIError(
                409,
                "Username taken"
            ))
            return;
        }
        else if(user1){
            res.json(new APIError(
                409,
                "Email taken"
            ))
            return;
        }
        else{
            next();
        }

    } catch (error) {
        res.json(new APIError(
                500,
                "Internal server error"
        ))
        return;
    }
    

}

export default UserDuplicacy;