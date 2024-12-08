import express from "express";
import { pinjamanItem } from "../controllers/pinjamControllers";
import { validatePeminjaman } from "../middlewares/verifyPinjam";
import { verifyRole, verifyToken } from "../middlewares/authorization";

const app = express();
app.use(express.json());

app.post("/pinjaman",[verifyToken,verifyRole(["ADMIN","USER"]),validatePeminjaman],pinjamanItem )

export default app;