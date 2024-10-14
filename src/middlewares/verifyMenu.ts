import { NextFunction, Request, Response } from "express";
import { request } from "http";
import Joi from 'joi';

const addDataSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().valid('FOOD','DRINK','SNACK').required(),
    description: Joi.string().required(),
    picture: Joi.allow().optional()
})

const editDataSchema = Joi.object({
    name: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    category: Joi.string().valid('FOOD','DRINK','SNACK').optional(),
    description: Joi.string().optional(),
    picture: Joi.allow().optional()
})

export const verifyAddMenu = (request: Request, response: Response, next: NextFunction) => {
    const { error } = addDataSchema.validate(request.body, { abortEarly: false})

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyEditMenu = (request: Request, response: Response, next: NextFunction) => {
    const { error } = editDataSchema.validate(request.body, { abortEarly: false})

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}
