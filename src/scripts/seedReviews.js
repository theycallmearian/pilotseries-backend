require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const csv = require('csv-parser')
const Review = require('../models/Review')
const Serie = require('../models/Serie')
const User = require('../models/User')
const path = require('path')

function parseDate(str) {
  if (!str) return new Date()
  const [d, m, y] = str.split('/')
  if (!d || !m || !y) return new Date()
  return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)
}

function readCSV(filepath) {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(filepath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  await Review.deleteMany()
  const series = await Serie.find()
  const users = await User.find({ rol: 'usuario' })
  const csvPath = path.resolve(__dirname, '../../reviews.csv')
  const reviewsData = await readCSV(csvPath)

  const keySerieTitulo = Object.keys(reviewsData[0]).find(
    (k) => k.trim() === 'serieTitulo'
  )
  const keyComentario = Object.keys(reviewsData[0]).find(
    (k) => k.trim() === 'comentario'
  )
  const keyRating = Object.keys(reviewsData[0]).find(
    (k) => k.trim() === 'rating'
  )
  const keyFecha = Object.keys(reviewsData[0]).find((k) => k.trim() === 'fecha')

  const validReviews = reviewsData.filter(
    (r) =>
      r[keySerieTitulo] &&
      r[keySerieTitulo].trim() !== '' &&
      r[keyComentario] &&
      r[keyComentario].trim() !== '' &&
      r[keyRating] &&
      !isNaN(parseFloat(r[keyRating]))
  )

  const findSerieId = (titulo) =>
    series.find((s) => s.serie.trim() === titulo.trim())?._id
  const randomUser = () => users[Math.floor(Math.random() * users.length)]._id

  const docs = []
  for (const r of validReviews) {
    const serieId = findSerieId(r[keySerieTitulo])
    if (!serieId) continue
    docs.push({
      serie: serieId,
      usuario: randomUser(),
      comentario: r[keyComentario],
      rating: parseFloat(r[keyRating]),
      fecha: parseDate(r[keyFecha]),
      likes: []
    })
  }
  await Review.insertMany(docs)
  console.log('Reviews insertadas:', docs.length)
  process.exit()
}
seed()
