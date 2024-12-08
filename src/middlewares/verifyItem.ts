import { Prisma } from '@prisma/client'
import  { NextFunction, Request, Response } from 'express'
import { stat } from 'fs'
import Joi from 'joi'

// menambahkan data untuk kebutuhan data
const addDataSchema = Joi.object({
    name: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    category: Joi.string().valid().required(),
    location: Joi.string().optional(),
    user: Joi.optional()
})

const editDataSchema = Joi.object({
    name: Joi.string().optional(),
    quantity: Joi.number().min(0).optional(),
    category: Joi.string().valid().optional(),
    location: Joi.string().optional(),
    user: Joi.optional()
})

export const verifyAddItem = (request: Request, response: Response, next: NextFunction) => {
    const { error } = addDataSchema.validate(request.body, { abortEarly: false })

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyEditItem = (request: Request, response: Response, next: NextFunction) => {
    const { error } = editDataSchema.validate(request.body, { abortEarly: false })

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}