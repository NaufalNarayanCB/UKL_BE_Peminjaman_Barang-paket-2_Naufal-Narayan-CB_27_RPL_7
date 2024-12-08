import { Request, Response } from "express"; //impor ekspress
import { PrismaClient} from "@prisma/client"; //
import { request } from "http";
const { v4: uuidv4 } = require("uuid");
import fs from "fs"
import { date, exist, number } from "joi";
import md5 from "md5"; //enskripsi password
import { sign } from "jsonwebtoken"; //buat mendapatkan token jsonwebtoken
import {BASE_URL, SECRET} from "../global";

const prisma = new PrismaClient({ errorFormat: "pretty" })
export const getAllItem = async (request: Request, response: Response) => { //endpoint perlu diganti ganti pakai const kalau tetap let
    //menyiapkan data input dulu(request) --> request
    try {
        //input
        const { search } = request.query //query boleh ada atau tidak params harus ada
        //main
        const allMenus = await prisma.item.findMany({
            where: { name: { contains: search?.toString() || "" } } //name buat mencari apa di seacrh, contains == like(mysql) [mengandung kata apa], OR/|| (Salah satu true semaunya all), ""untuk menampilkan kosong
        })
        //output
        return response.json({ //tampilkan juga statusnya(untuk inidkator)
            status: true,
            data: allMenus,
            massage: 'Ini Item Nya Bro'
        }).status(200) //100 200 Berhasil
    }
    catch (eror) {
        return response
            .json({
                status: false,
                massage: `Eror Sam ${eror}`
            })
            .status(400)
    }
}

export const createItem = async (request: Request, response: Response) => {
    try {
        const { name, quantity, location, category} = request.body
        const uuid = uuidv4()

        const newMenu = await prisma.item.create({ //await menunngu lalu dijalankan
            data: {uuid, name, quantity: Number(quantity), location, category}
        })
        return response.json({
            Status: true,
            data: newMenu,
            massage: `Bikin item DONE`
        }).status(200);
    }
    catch (eror) {
        return response
            .json({
                status: false,
                massage: `Eror Bro. $(eror)`
            }).status(400);
    }
}

export const updateItem = async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const { name, location, quantity, category } = request.body

        const findItem = await prisma.item.findFirst({ where: { id  : Number(id) } })
        if (!findItem) return response
            .status(200)
            .json({ status: false, massage: 'Tidak Ada Item Nya' })

        const updateItem = await prisma.item.update({
            data: {
                name: name || findItem.name, //or untuk perubahan (kalau ada yang kiri dijalankan, misal tidak ada dijalankan yang kanan)
                quantity: quantity ? Number(quantity) : findItem.quantity, //operasi tenary (sebelah kiri ? = kondisi (price) jika kondisinya true (:) false )
                location: location || findItem.location,
                category: category || findItem.category
            },
            where: { id: Number(id) }
        })

        return response.json({
            status: true,
            data: updateItem,
            massage: 'Update Item Berhasil'
        })

    } catch (error) {
        return response
        .json({
            status: false,
            massage : `Eror Bro ${error}`
        })
        .status(400)
    }
}

export const deleteItem = async (request: Request, response: Response) => {
        try {
            const {id} = request.params
            const findItem = await prisma.item.findFirst({where: {id: Number(id)}})
            if (!findItem) return response
            .status(200)
            .json({status: false, message: 'Ra Nemu Sam'})
    
            const deletedItem = await prisma.item.delete({
                where: {id: Number(id)}
            })
            return response.json({
                status: true,
                data:deleteItem,
                message: 'Item Bisa Dihapus'
            }).status(200)
        } catch (eror) {
            return response
            .json({
                status:false,
                message: `Eror Bro ${eror}`
            }).status(400)
        }
    }

    export const authentication = async (request: Request, response: Response) => {
        try {
            const { username, password } = request.body;
            const findCustomer = await prisma.user.findFirst({
                where: { username, password: md5(password) },
            });
            if (!findCustomer) {
                return response
                    .status(200)
                    .json({
                        status: false,
                        logged: false,
                        massage: `Username Sama Password Salah`
                    })
            }
            let data = {
                id: findCustomer.id,
                username: findCustomer.username,
                password: findCustomer.password,
            }
            let payload = JSON.stringify(data); //mennyiapakan data untuk menjadikan token
            let token = sign(payload, SECRET || "token");
    
            return response
                .status(200)
                .json({
                    status: true,
                    logged: true,
                    message: `Login Succes`, token
                })
        } catch (error) {
            return response
                .json({
                    status: false,
                    message: `Eror Ga Boong ${error}`
                }).status(400)
        }
    }

    export const getItemById = async (req: Request, res: Response) => {
      try {
        const itemId = parseInt(req.params.id); // Ambil ID dari parameter URL
        const item = await prisma.item.findUnique({
          where: { id: itemId }, // Cari item berdasarkan ID
        });
    
        if (!item) {
          return res.status(404).json({ message: "Item tidak ditemukan" });
        }
    
        res.status(200).json(item); // Kirimkan data item sebagai respons
      } catch (error: any) {
        res.status(500).json({ error: error.message }); // Tangani error
      }
    };
    