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

export const getAllPinjam = async (req: Request, res: Response) => {
    try {
        const AllPinjam = await prisma.peminjaman.findMany({
            include: {
                User: true,
                Item: true
            }
        })

        return res.json({
            status: true,
            message:`berhasil tampil data peminjaman`,
            data: AllPinjam
        }).status(200)
    } catch (error) {
        return res.json({
            status: false,
            message: `gagal tampil data peminjaman`
        }).status(400)
    }
}

export const analisis = async (request: Request, response: Response) => {
    const { start_date, end_date, group_by } = request.body;

    if (!start_date || !end_date || !group_by) {
        return response.status(400).json({
            status: "error",
            message: "Tanggal mulai, tanggal akhir, dan kriteria pengelompokan harus diisi.",
        });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return response.status(400).json({
            status: "error",
            message: "Format tanggal tidak valid.",
        });
    }

    try {
        let usageReport;
        let additionalInfo: Array<{ itemId: number, [key: string]: any }> = [];

        if (group_by === 'category') {
            usageReport = await prisma.peminjaman.groupBy({
                by: ['itemId'],
                where: {
                    pinjamDate: {
                        gte: startDate,
                        lte: endDate
                    },
                },
                _count: {
                    itemId: true,
                },
                _sum: {
                    quantity: true,
                },
                orderBy: { itemId: 'asc' } // Order by itemId ascending
            });

            const ids = usageReport.map(item => item.itemId);
            additionalInfo = await prisma.item.findMany({
                where: {
                    id: { in: ids }
                },
                select: { id: true, category: true }
            }).then(items => items.map(item => ({
                itemId: item.id,
                category: item.category
            })));
        } else if (group_by === 'location') {
            usageReport = await prisma.peminjaman.groupBy({
                by: ['itemId'],
                where: {
                    pinjamDate: {
                        gte: startDate,
                        lte: endDate
                    },
                },
                _count: {
                    itemId: true,
                },
                _sum: {
                    quantity: true,
                },
                orderBy: { itemId: 'asc' } // Order by itemId ascending
            });

            const ids = usageReport.map(item => item.itemId);
            additionalInfo = await prisma.item.findMany({
                where: {
                    id: { in: ids }
                },
                select: { id: true, location: true }
            }).then(items => items.map(item => ({
                itemId: item.id,
                location: item.location
            })));
        } else {
            return response.status(400).json({
                status: "error",
                message: "Kriteria pengelompokan tidak valid. Gunakan 'category' atau 'location'.",
            });
        }

        const returnedItems = await prisma.peminjaman.groupBy({
            by: ['itemId'],
            where: {
                pinjamDate: {
                    gte: startDate,
                    lte: endDate
                },
                returnDate: {
                    gte: startDate,
                    lte: endDate
                },
                Status: 'KEMBALI'
            },
            _count: {
                itemId: true,
            },
            _sum: {
                quantity: true,
            },
            orderBy: { itemId: 'asc' } // Order by itemId ascending
        });

        const notReturnedItems = await prisma.peminjaman.groupBy({
            by: ['itemId'],
            where: {
                pinjamDate: {
                    gte: startDate,
                    lte: endDate
                },
                OR: [
                    {
                        returnDate: {
                            gt: endDate
                        }
                    },
                    {
                        returnDate: {
                            equals: new Date(0)
                        }
                    },
                    {
                        Status: 'DIPINJAM'
                    }
                ]
            },
            _count: {
                itemId: true,
            },
            _sum: {
                quantity: true,
            },
            orderBy: { itemId: 'asc' } // Order by itemId ascending
        });

        const usageAnalysis = usageReport.map(item => {
            const info = additionalInfo.find(info => info.id === item.itemId);
            const returnedItem = returnedItems.find(returned => returned.itemId === item.itemId);
            const totalReturned = returnedItem?._count?.itemId ?? 0;
            const itemsInUse = item._count.itemId - totalReturned;
            return {
                group: info ? info[group_by as keyof typeof info] || 'Unknown' : 'Unknown',
                total_borrowed: item._count.itemId,
                total_returned: totalReturned,
                items_in_use: itemsInUse
            };
        });

        response.status(200).json({
            status: "success",
            data: {
                analysis_period: {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                },
                usage_analysis: usageAnalysis
            },
            message: "Laporan penggunaan barang berhasil dihasilkan.",
        });
    } catch (error) {
        response.status(500).json({
            status: "error",
            message: `Terjadi kesalahan. ${(error as Error).message}`,
        });
    }
};

//laporan

export const borrowAnalysis = async (req: Request, res: Response) => {
    const { start_date, end_date } = req.body

    if (!start_date || !end_date) {
        return res.json({
            status: false,
            message: `Tanggal mulai dan akhir harus diisi ya ges`
        }).status(400)
    }

    const tanggalMulai = new Date(start_date)
    const tanggalAkhir = new Date(end_date)

    if (isNaN(tanggalMulai.getTime()) || isNaN(tanggalAkhir.getTime())) {
        return res.json({
            status: false,
            message: `Tanggal harus berupa tanggal yang valid ya ges`
        }).status(400)
    }

    try {
        const freqBarangDipinjam = await prisma.peminjaman.groupBy({
            by: ['itemId'],
            where: {
                pinjamDate: {
                    gte: tanggalMulai
                },
                returnDate: {
                    lte: tanggalAkhir
                }
            },
            _count: {
                itemId: true
            },
            orderBy: {
                _count: {
                    itemId: 'desc'
                }
            }
        })

        const detailFreqBarangDipinjam = await Promise.all(freqBarangDipinjam.map(async item => {
            const barang = await prisma.item.findUnique({
                where: { id: item.itemId },
                select: { id: true, name: true, category: true }
            })
            return barang ? {
                item_id: item.itemId,
                nama: barang.name,
                category: barang.category,
                total_pinjam: item._count.itemId
            } : null
        })).then(hasil => 
            hasil.filter(barang => barang != null))

        const inefficientItems = await prisma.peminjaman.groupBy({
            by: ['itemId'],
            where: {
                pinjamDate: {
                    gte: tanggalMulai
                },
                returnDate: {
                    gt : tanggalAkhir
                }
            },
            _count: {
                itemId: true
            },
            _sum: {
                quantity: true
            },
            orderBy: {
                _count: {
                    itemId: 'desc'
                }
            }
        })

        const detailInefficientItems = await Promise.all(inefficientItems.map(async item => {
            const barang = await prisma.item.findUnique({
                where: { id: item.itemId },
                select: { id: true, name: true, category: true }
            })
            return barang ? {
                itemId: item.itemId,
                nama: barang.name,
                category: barang.category,
                total_pinjam: item._count.itemId,
                total_terlambat_kembali: item._sum.quantity ?? 0
            } : null
        })).then(hasil => 
            hasil.filter(barang => barang != null))

        res.json({
            status: true,
            data: {
                analysis_period: {
                    tgl_mulai: tanggalMulai,
                    tgl_akhir: tanggalAkhir
                },
                freqBarangDipinjam: detailFreqBarangDipinjam,
                inefficientItems: detailInefficientItems
            },
            message: 'Data item berhasil diambil'
        })
    }   catch (error) {
        res.json({
            status: false,
            message: `Terjadi kesalahan ${(error as Error).message}`
        })
    }
}