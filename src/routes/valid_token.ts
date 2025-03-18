import { Request, Response } from "express";
import APIError from "../utils/APIError";
import jwt, { JwtPayload } from 'jsonwebtoken'
import APIResponse from "../utils/APIResponse";
import { config } from "dotenv";
config();

interface customJWTPayload extends JwtPayload{
    username: string
}

export const valid_token = async (req: Request, res: Response) => {
    console.log("Hello")
    const bearer_token = req.cookies['BCC'];
    if(bearer_token){
        if(bearer_token.split(" ").length == 2){
            const token = bearer_token.split(" ")[1];
            const SECRET_KEY = process.env.SECRET_KEY;
            if(SECRET_KEY){
                try {
                    const result = await jwt.verify(token, SECRET_KEY) as customJWTPayload
                    if(result){
                        res.json(new APIResponse(
                            200,
                            "Authorized",
                            result.username
                        ))
                        return;
                    } else {
                        res.json(new APIError(
                            401,
                            "Unauthorized"
                        ))
                        return;    
                    }
                } catch (error) {
                    res.json(new APIError(
                        401,
                        "Unauthorized"
                    ))
                    return;    
                }
            } else {
                res.json(new APIError(
                    500,
                    "Internal server error"
                ))
                return;
            }

        } else {
            res.json(new APIError(
                401,
                "Unauthorized"
            ))
            return;
        }
    } else {
        res.json(new APIError(
            401,
            "Unauthorized"
        ))
        return;
    }


}