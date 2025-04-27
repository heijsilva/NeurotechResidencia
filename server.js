import express from 'express'
// import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const app = express()
// const prisma = new PrismaClient()
const PORT = process.env.port || 3000

app.use(express())

app.get('/', (req, res) => {
    res.send('Hello, World!')
})

// Exemplo Prisma
// app.get('/usuarios', async (req, res) => {
//     const users = await prisma.users.findMany()
//     res.status(200).json(users)
// })

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
