import jwt from 'jsonwebtoken';
import { config } from "dotenv";
config();

import APIResponse from './../utils/APIResponse';

import { Request, Response } from "express";

import dotenv from 'dotenv';
import APIError from "../utils/APIError";
dotenv.config();

export const signin = async (req: Request, res: Response) => {

    const username = req.headers.username;

    try {
        const SECRET_KEY = process.env.SECRET_KEY;
        if(SECRET_KEY){
            const token = await jwt.sign({
                username : username,
            },SECRET_KEY);
        
            res.cookie('BCC', `Bearer ${token}`, {
                sameSite: 'none'
            });
            res.json(new APIResponse(
                200,
                "User signed in"
            ))
            return;
        } else {
            res.json(new APIError(
                500,
                "Internal server error"
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