import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { request } from "http";
import { number } from "joi";
import fs from "fs"
import { BASE_URL, SECRET } from "../global";
import md5 from "md5"
const { v4: uuidv4 } = require("uuid")
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient({ errorFormat: "pretty" })
// export const PinjamItems = async (request: Request, response: Response) => {
//     try {
//         const { userId, itemId, pinjamDate, returnDate, quantity } = request.body;

//         // Validasi input
//         if (!userId || !itemId || !pinjamDate || !returnDate ) {
//             return response.status(400).json({
//                 status: false,
//                 message: 'Data yang diperlukan tidak lengkap.',
//             });
//         }

//         // Validasi tanggal pengembalian
//         if (new Date(returnDate) <= new Date(pinjamDate)) {
//             return response.status(400).json({
//                 status: false,
//                 message: 'Tanggal pengembalian tidak boleh kurang dari atau sama dengan tanggal peminjaman.',
//             });
//         }

//         // Cek stok barang
//         const item = await prisma.item.findUnique({
//             where: { id: Number(itemId) },
//         });

//         if (!item) {
//             return response.status(404).json({
//                 status: false,
//                 message: 'Item tidak ditemukan.',
//             });
//         }

//         if (item.quantity < Number(quantity)) {
//             return response.status(400).json({
//                 status: false,
//                 message: 'Stok barang tidak mencukupi.',
//             });
//         }

//         // Cek keberadaan user
//         const user = await prisma.user.findUnique({
//             where: { id: Number(userId) },
//         });

//         if (!user) {
//             return response.status(404).json({
//                 status: false,
//                 message: 'User tidak ditemukan.',
//             });
//         }

//         // Buat data peminjaman
//         const newPeminjaman = await prisma.peminjaman.create({
//             data: {
//                 userId: Number(userId),
//                 itemId: Number(itemId),
//                 quantity: Number(quantity),
//                 pinjamDate: new Date(pinjamDate),
//                 returnDate: new Date(returnDate),
//                 Status: 'DIPINJAM', // Enum Prisma (gunakan huruf kecil jika schema butuh)
//             },
//         });

//         // Update stok barang
//         await prisma.item.update({
//             where: { id: Number(itemId) },
//             data: {
//                 quantity: item.quantity - Number(quantity),
//             },
//         });

//         return response.status(200).json({
//             status: true,
//             message: 'Peminjaman berhasil dicatat.',
//             data: newPeminjaman,
//         });
//     } catch (error) {
//         console.error(error);
//         return response.status(500).json({
//             status: false,
//             message: `Terjadi kesalahan: ${error instanceof Error ? error.message : String(error)}`,
//         });
//     }
// };


export const pinjamanItem = async (request: Request, response: Response) => {
    try {
        const { userId, itemId, pinjamDate, returnDate } = request.body;
        const qty = 1;

        const findUser = await prisma.user.findFirst({
            where: { id: Number(userId) },
        });
        if (!findUser) {
            return response.status(200).json({
                status: false,
                message: `User with id: ${userId} is not found`,
            });
        }

        const findItem = await prisma.item.findFirst({
            where: { id: Number(itemId) },
        });
        if (!findItem) {
            return response.status(200).json({
                status: false,
                message: `Item with id: ${itemId} is not found`,
            });
        }

        const item = await prisma.item.findUnique({
            where: { id: Number(itemId) },
            select: { quantity: true },
        });

        if (!item || item.quantity === 0) {
            return response.status(400).json({
                status: false,
                message: "Item kosong",
            });
        }

        const newPeminjaman = await prisma.peminjaman.create({
            data: {
                userId: Number(userId),
                itemId: Number(itemId),
                quantity: Number(qty),
                pinjamDate: new Date(pinjamDate),
                returnDate: new Date(returnDate),
            },
        });

        const updateItem = await prisma.item.update({
            where: {
                id: Number(itemId),
            },
            data: {
                quantity: {
                    decrement: Number(qty),
                },
            },
        });

        return response.status(200).json({
            status: true,
            data: newPeminjaman,
            message: "Peminjaman item berhasil dicatat",
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Terjadi kesalahan. ${(error as Error).message}`,
        });
    }
};