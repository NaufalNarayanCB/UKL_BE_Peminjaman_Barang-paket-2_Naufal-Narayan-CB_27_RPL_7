import express from "express"
import { getAllItem, createItem, updateItem, deleteItem, getItemById, } from "../controllers/itemControllers"
import { verifyAddItem, verifyEditItem } from "../middlewares/verifyItem"
import { verifyRole, verifyToken } from "../middlewares/authorization"


const app = express()
app.use(express.json())

app.get(`/`, [verifyToken, verifyRole(["ADMIN"])], getAllItem)
app.post(`/`, [verifyToken, verifyRole(["ADMIN"]), verifyAddItem], createItem)
app.put(`/:id`, [verifyToken, verifyRole(["ADMIN"]), verifyEditItem], updateItem)
app.delete(`/:id`, [verifyToken, verifyRole(["ADMIN"])], deleteItem)
app.get('/:id', getItemById)


export default app