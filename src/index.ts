import express from 'express'
import cors from 'cors'
import UserRoute from './routes/userRoutes'
import itemRoute from './routes/itemRoutes'
import pinjamRoutes from './routes/pinjamRoutes'
import returnRoutes  from './routes/returnRoutes'
import analisis  from './routes/analisisRoutes'

const PORT: number = 8000
const app = express()
app.use(cors())

app.use('/api/auth', UserRoute)
app.use('/api/inventory',itemRoute)
app.use('/api/inventory',pinjamRoutes)
app.use('/api/inventory', returnRoutes)
app.use('/api', analisis)

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`) 
})