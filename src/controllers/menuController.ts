import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { request } from "http";
import { number } from "joi";
import fs from "fs"
import { BASE_URL } from "../global";
const { v4: uuidv4 } = require("uuid")

const prisma = new PrismaClient ({errorFormat: "pretty"})
export const getAllMenus = async (request: Request, response: Response) => {
    try {
        const { search } = request.query
        const allMenus = await prisma.menu.findMany({
            where: { name: { contains: search?.toString() || ""}}
        })
        return response.json({
            status: true,
            data: allMenus,
            message: 'Menu bar retrived'
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. $(error)`
        })
        .status(400)
    }
}

export const createMenu = async (request: Request, response: Response) => {
    try {
        const { name, price, category, description } = request.body
        const uuid = uuidv4()

        const newMenu = await prisma.menu.create({ //await menunngu lalu dijalankan
            data: { uuid, name, price: Number(price), category, description }
        })
        return response.json({
            Status: true,
            data: newMenu,
            massage: `Gawe Menu E Iso Cah`
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

export const updateMenu = async (request: Request,response:Response) => {
    try {
        const { id } = request.params
        const { name, price, category, description } = request.body

        const findMenu = await prisma.menu.findFirst({ where: { id: Number(id) } })
        if (!findMenu)  return response
        .status(200)
        .json({ status: false, message: `Menu is not found` })

        const updateMenu = await prisma.menu.update({
            data: {
                name: name || findMenu.name,
                price: price ? Number(price) : findMenu.price, //ternary
                category: category || findMenu.category,
                description: description || findMenu.description
            },
            where: { id :Number(id) }
        })

        return response.json({
            status: true,
            data: updateMenu,
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

export const changePicture = async ( request: Request, response: Response) => {
    try{
        const { id } = request.params

        const findMenu = await prisma.menu.findFirst({ where: { id: Number(id) } })
        if (!findMenu) return response
        .status(200)
        .json({ status: false, message: `Menu is not found` })

        let filename = findMenu.picture
        if (request.file) {
            filename = request.file.filename
            let path = `${BASE_URL}/../public/menu_picture/${findMenu.picture}`
            let exists = fs.existsSync(path)
            if(exists && findMenu.picture !== ``) fs.unlinkSync(path)
        }

        const updatePicture = await prisma.menu.update({
            data: {picture: filename},
            where: {id: Number(id)}
        })

        return response.json({
            status: true,
            data: updatePicture,
            message: `Picture has changed`
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}

export const deleteMenu = async (request: Request, response: Response) => {
    try {
        const {id} = request.params
        const findMenu = await prisma.menu.findFirst({where: {id: Number(id)}})
        if (!findMenu) return response
        .status(200)
        .json({status: false, message: 'Ra Nemu Sam'})

        const deletedMenu = await prisma.menu.delete({
            where: {id: Number(id)}
        })
        return response.json({
            status: true,
            data:deleteMenu,
            message: 'Menu E Iso Dihapus Sam'
        }).status(200)
    } catch (eror) {
        return response
        .json({
            status:false,
            message: `Eror Sam ${eror}`
        }).status(400)
    }
}
