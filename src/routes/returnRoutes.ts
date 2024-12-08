import express from "express";
import { returnItem } from "../controllers/returnController";
import { validateReturn } from "../middlewares/verifyReturn";
import { verifyRole, verifyToken } from "../middlewares/authorization";

const app = express();
app.use(express.json());

app.post("/return",[verifyToken,verifyRole(["ADMIN","USER"]),validateReturn],returnItem )

export default app;