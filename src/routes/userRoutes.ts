import express from "express";
import { authentication, createUser, deleteUser, getAllUser, updateUser } from "../controllers/userControllers";
import { verifyAuthentication, verifyAddUser } from "../middlewares/userValidation";
import { verifyRole, verifyToken } from "../middlewares/authorization";

const app = express();
app.use(express.json());

app.post(`/create`, [verifyAddUser], createUser);
app.post(`/login`, [verifyAuthentication], authentication);
app.get(`/`, getAllUser)
app.put(`/:id`, updateUser)
app.delete(`/:id`,[verifyToken,verifyRole(["ADMIN","USER"])], deleteUser)

export default app;