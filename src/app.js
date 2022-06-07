import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'

import userRouter from './routes/users.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/users', userRouter)

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 3001
await mongoose.connect(`mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.9fcknfh.mongodb.net/?retryWrites=true&w=majority`)
try {
  app.listen(PORT, () => console.log(`Serving @ ${PORT}`))
} catch (err) {
  console.log(err)
}
