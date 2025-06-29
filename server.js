require('dotenv').config()
const express = require('express')
const connectDB = require('./src/config/db')
const cors = require('cors')
const path = require('path')

const app = express()
connectDB()

const allowedOrigins = process.env.ORIGINS.split(',')
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true)
      callback(new Error('Origen no permitido'))
    }
  })
)

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', require('./src/routes/auth'))
app.use('/api/usuarios', require('./src/routes/users'))
app.use('/api/series', require('./src/routes/series'))
app.use('/api/reviews', require('./src/routes/reviews'))
app.use(require('./src/middlewares/errorHandler'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server escuchando en puerto ${PORT}`))
