require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Serie = require('../models/Serie')

const NUM_USERS = 20
const DEFAULT_PASSWORD = 'Password123!'

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function shuffleArray(array) {
  return array.sort(() => 0.5 - Math.random())
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    const allSeries = await Serie.find().select('_id')
    const seriesIds = allSeries.map((s) => s._id)

    await User.deleteMany()
    console.log('Usuarios anteriores borrados.')

    await new User({
      nombre: 'Admin',
      email: 'admin@pilotseries.com',
      password: DEFAULT_PASSWORD,
      rol: 'admin'
    }).save()
    console.log('Usuario admin creado.')

    for (let i = 1; i <= NUM_USERS; i++) {
      const nombre = `User${i}`
      const email = `user${i}@pilotseries.com`
      const followCount = getRandomInt(2, 6)
      const followList = shuffleArray([...seriesIds]).slice(0, followCount)
      const remaining = seriesIds.filter((id) => !followList.includes(id))
      const finishCount = getRandomInt(1, Math.min(5, remaining.length))
      const finishList = shuffleArray([...remaining]).slice(0, finishCount)

      await new User({
        nombre,
        email,
        password: DEFAULT_PASSWORD,
        rol: 'usuario',
        seguimientoSeries: followList,
        seriesFinalizadas: finishList,
        favoritosSeries: [followList[0]]
      }).save()
    }

    console.log('Usuarios de ejemplo creados.')
  } catch (error) {
    console.error('Error en seed:', error)
  } finally {
    await mongoose.disconnect()
    process.exit()
  }
}

seed()
