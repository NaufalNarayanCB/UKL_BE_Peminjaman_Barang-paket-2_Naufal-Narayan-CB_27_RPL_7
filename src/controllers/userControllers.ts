import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { request } from "http";
import { number } from "joi";
import fs from "fs"
import { BASE_URL, SECRET } from "../global";
import md5 from "md5"
const { v4: uuidv4 } = require("uuid")
import { sign } from "jsonwebtoken";


const prisma = new PrismaClient ({errorFormat: "pretty"})
export const getAllUser = async (request: Request, response: Response) => {
    try {
        const { search } = request.query
        const allUser = await prisma.user.findMany({
            where: { username: { contains: search?.toString() || ""}}
        })
        return response.json({
            status: true,
            data: allUser,
            message: 'Ini di isi user e'
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `Error Bro $(error)`
        })
        .status(400)
    }
}

export const createUser = async (request: Request, response: Response) => {
    try {
        const { username, password, role} = request.body
        const uuid = uuidv4()

        const newUser = await prisma.user.create({ 
            data: { uuid, username,password: md5(password), role}
        })
        return response.json({
            Status: true,
            data: newUser,
            massage: `Berhasil Bro`
        }).status(200);
    }
    catch (eror) {
        return response
            .json({
                status: false,
                massage: `Username Sudah Digunakan`
            }).status(400);
    }
}

export const updateUser = async (request: Request,  response: Response) => {
    try {
        const { id } = request.params
        const { username, password,} = request.body
        
        const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
        if  (!findUser) return response
        .status(200)
        .json({ status: false, message: "User is not found" })
        
        const  updateUser = await prisma.user.update({
            data: {
                username: username ||  findUser.username,
                password: md5(password) || findUser.password,
            },
            where: { id: Number(id) }
        }) 
        
        return response.json({
            status: true,
            data: updateUser,
            message: `User has updated`
        }).status(200)
    } catch (error) {
        return response
        .json({
            status: false,
            message: `There is an error. ${error}`
        })
        .status(400)
    }
}

export const deleteUser = async (request: Request, response: Response) => {
        try {
            const { id } = request.params;
    
            const findUser = await prisma.user.findFirst({ where: { id: Number(id) } });
            if (!findUser) return response.status(404).json({ status: false, message: `User Sudah Dihapus` });
    
            await prisma.user.delete({ where: { id: Number(id) } });
    
            return response.status(200).json({
                status: true,
                message: `User has been deleted`
            })
        } catch (error) {
            return response.status(400).json({
                status: false,
                message: `There was an error. ${error}`
        })
    }
}

export const authentication = async (request: Request, response: Response) => {
    try {
      const { username, password } = request.body;

      const findUser = await prisma.user.findFirst({
        where: { username, password: md5(password) },
      });

        if (!findUser) {
            return response.status(200).json({
                status: false,
                loged: false,
                message: `Username or Password is invalid`
            });

            
        }
        let data = {
            password: findUser.password,
            id: findUser.id,
            username: findUser.username,
            role: findUser.role,
        };

        let payload = JSON.stringify(data);
        let token = sign(payload, SECRET || "token")
        
        return response.status(200)
        .json({ status: true, logged: true, message: `Login Succes`, token});
    } catch (error) {
        return response
        .json({
            status: false,
            message: `There is an error. $(error)`
        })
        .status(400)
    }
};