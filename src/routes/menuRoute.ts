import express from "express"
import { changePicture, createMenu, deleteMenu, getAllMenus, updateMenu} from "../controllers/menuController"
import { verifyAddMenu, verifyEditMenu } from "../middlewares/verifyMenu"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import uploadFile from "../middlewares/menuUpload"


const app = express()
app.use(express.json())

app.get(`/`, [verifyToken, verifyRole(["CASHIER", "MANAGER"])], getAllMenus)
app.post(`/`, [verifyToken, verifyRole(["MANAGER"])], [verifyAddMenu], createMenu)
app.put(`/:id`, [verifyToken, verifyRole(["MANAGER"])], [verifyEditMenu], updateMenu)
app.put(`/pic/:id`, [verifyToken, verifyRole(["MANAGER"])], [uploadFile.single("picture")], changePicture)
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteMenu)

export default app