import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const returnItem = async (request: Request, response: Response) => {
    try {
        const { id_peminjaman, returnDate, Status } = request.body;
        const peminjaman = await prisma.peminjaman.findUnique({ 
          where: { 
            id_peminjaman: Number(id_peminjaman) 
          },
             select: { quantity: true, Status: true,itemId:true },
            });;
          if (!peminjaman) 
            { return response.status(404).json({
               status: false, 
               message: "Data peminjaman tidak ditemukan",
               });
              }
              if (peminjaman.Status === 'KEMBALI'){
                return response.status(400).json({
                  status: false,
                  message: `Barang sudah dikembalikan dan tidak bisa dikembalikan lagi.`,
                })
              }
        const updatedPeminjaman = await prisma.peminjaman.update({
            where: { id_peminjaman: Number(id_peminjaman) },
            data: {
                returnDate: new Date(returnDate),
                Status: Status,
            },
        })  

        const updateItem = await prisma.item.update({
           where: { 
            id: Number(peminjaman.itemId),
          }, data: { 
            quantity: { 
              increment: peminjaman.quantity, 
            }, 
          },
        })

        return response.json({
            status: true,
            data: updatedPeminjaman,
            message: "Pengembalian item berhasil dicatat",
        }).status(200);
    } catch (error) {
        return response.json({
            status: false,
            message: `Terjadi kesalahan.${error}`,
        }).status(400);
    }
};
