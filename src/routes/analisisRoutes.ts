import express from "express"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import { validateAnalis } from "../middlewares/verifyAnalisis"
import { analisis, borrowAnalysis, getAllPinjam} from "../controllers/analisisControllers"

const app = express()
app.use(express.json())

app.post(`/usage-report`,[verifyToken,verifyRole(["ADMIN"]),validateAnalis],analisis)
app.post(`/borrow-analysis`,[verifyToken,verifyRole(["ADMIN"]),borrowAnalysis],borrowAnalysis)
app.get('/', [verifyToken, verifyRole(["ADMIN"])], getAllPinjam)


export default app;