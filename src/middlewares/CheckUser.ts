import { NextFunction, Request, Response } from 'express';
import APIError from '../utils/APIError.js';
import models from './../database/MONGO_DB.js'
import { compare } from 'bcrypt';

const CheckUser = async (req: Request, res: Response, next: NextFunction) => {

    const username = req.headers?.username;
    const password = req.headers?.password;

    if(!username){
        res.json(new APIError(
            400,
            "Username required"
        ))
        return;
    }

    if(!password){
        res.json(new APIError(
            400,
            "Password required"
        ))
        return;
    }

    try {
        
        const user = await models.User.findOne({
            userName: username
        })

        if(user){
            const hashedPassword = user.Password;
            if(typeof password == "string" && typeof hashedPassword == "string"){
                if( await compare(password,hashedPassword)){
                    next();
                }
                else{
                    res.json(new APIError(
                        401,
                        "Incorrect password"
                    ))
                    return;
                }
            } else {
                res.json(new APIError(
                    400,
                    "Invalid Password"
                ))
                return;
            }
        }
        else{
            res.json(new APIError(
                401,
                "User not found"
            ))
            return;
        }

    } catch (error) {
        res.json(new APIError(
            500,
            "Internal server error"
        ))
        return;
    }

}

export default CheckUser;