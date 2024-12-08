import { NextFunction,Request,Response } from "express";
import Joi from "joi"

const returnSchema = Joi.object({
    id_peminjaman: Joi.number().required(), //integer
    returnDate: Joi.date().iso().required(),
    Status: Joi.string().valid("KEMBALI","HILANG").optional(),
    user: Joi.optional(),
});

export const validateReturn = (req: Request, res: Response, next: NextFunction) => {
    const { error } = returnSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join(),
        });
    }
    next();
};
