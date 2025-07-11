const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
app.use(express.json())

const allowed = process.env.ORIGINS?.split(',') || ['*']
app.use(cors({ origin: allowed }))


mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Conectado a MongoDB!'))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/usuarios', require('./routes/users'))
app.use('/api/series', require('./routes/series'))
app.use('/api/reviews', require('./routes/reviews'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
