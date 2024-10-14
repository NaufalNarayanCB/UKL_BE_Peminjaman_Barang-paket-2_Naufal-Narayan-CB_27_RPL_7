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
            where: { name: { contains: search?.toString() || ""}}
        })
        return response.json({
            status: true,
            data: allUser,
            message: 'Iki isi user e cah'
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `Error sam. $(error)`
        })
        .status(400)
    }
}

export const createUser = async (request: Request, response: Response) => {
    try {
        const { name, email, password, Role } = request.body
        const uuid = uuidv4()

        const newUser = await prisma.user.create({ 
            data: { uuid, name, email, password: md5(password), Role}
        })
        return response.json({
            Status: true,
            data: newUser,
            massage: `Berhasil cah`
        }).status(200);
    }
    catch (eror) {
        return response
            .json({
                status: false,
                massage: `Eror iii. ${eror}`
            }).status(400);
    }
}

export const updateUser = async (request: Request,  response: Response) => {
    try {
        const { id } = request.params
        const { name,  email, password, Role } = request.body

        const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
        if  (!findUser) return response
        .status(200)
        .json({ status: false, message: "User is not found" })
        
        const  updateUser = await prisma.user.update({
            data: {
                name: name ||  findUser.name,
                email: email || findUser.email,
                password: md5(password) || findUser.password,
                Role: Role ||  findUser.Role
            },
            where: { id: Number(id) }
        }) 
        
        return response.json({
            status: true,
            data: updateUser,
            message: `Menu has updated`
        }).status(200)
    } catch (error) {
        return response
        .json({
            status: false,
            message: `There is an error.${error}`
        })
        .status(400)
    }
}

export const changePictureProf = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        const findUser = await prisma.user.findFirst({ where: { id: Number(id) } });
        if (!findUser) return response.status(404).json({ status: false, message: `User not found `});

        let filename = findUser.profile_picture;
        if (request.file) {
            filename = request.file.filename;

            const oldFilePath =`${BASE_URL}/../public/profil_picture/${findUser.profile_picture}`;
            const fileExists = fs.existsSync(oldFilePath);
            if (fileExists && findUser.profile_picture !== "") fs.unlinkSync(oldFilePath);
        }

        const updateUser = await prisma.user.update({
            data: { profile_picture: filename },
            where: { id: Number(id) }
        })

        return response.status(200).json({
            status: true,
            data: updateUser,
            message: `Profile picture has been changed`
        })
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There was an error. ${error}`
        })
    }
}
export const deleteUser = async (request: Request, response: Response) => {
        try {
            const { id } = request.params;
    
            const findUser = await prisma.user.findFirst({ where: { id: Number(id) } });
            if (!findUser) return response.status(404).json({ status: false, message: `User not found` });
    
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
        const { email, password } = request.body;

        const findUser = await prisma.user.findFirst({
            where: { email, password: md5(password) },
        });

        if (!findUser) {
            return response.status(200).json({
                status: false,
                loged: false,
                message: `Email or Password is invalid`
            });

            
        }
        let data = {
            id: findUser.id,
            email: findUser.email,
            name: findUser.name,
            Role: findUser.Role,
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