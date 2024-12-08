import { NextFunction,Request,Response } from "express";
import Joi from "joi"


const peminjaman = Joi.object({
    userId: Joi.number().required(),
    itemId: Joi.number().required(),    
    pinjamDate: Joi.date().iso().required(),
    returnDate: Joi.date().iso().min(Joi.ref('pinjamDate')).required(),
    user: Joi.optional(),
});

export const validatePeminjaman = (req: Request, res: Response, next: NextFunction) => {
    const { error } = peminjaman.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join(),
        });
    }
    next();
};