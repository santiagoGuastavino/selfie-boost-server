import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import 'dotenv/config'

import usersRouter from './routes/users.js'
import blogsRouter from './routes/blogs.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.use('/user', usersRouter)
app.use('/blog', blogsRouter)

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 3001
await mongoose.connect(`mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.9fcknfh.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`)
try {
  app.listen(PORT, () => console.log(`Serving @ ${PORT}`))
} catch (err) {
  console.log(err)
}
