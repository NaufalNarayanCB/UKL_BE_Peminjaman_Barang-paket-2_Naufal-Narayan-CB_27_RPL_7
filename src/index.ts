import express from 'express'
import cors from 'cors'
import MenuRoute from './routes/menuRoute'
import userRoutes from './routes/userRoutes'

const PORT: number = 8000
const app = express()
app.use(cors())

app.use('/menu', MenuRoute);
app.use("/user", userRoutes)

app.listen(PORT), () => {
    console.log(`[server]: Server is running at https:localhost: $(PORT)`)
}