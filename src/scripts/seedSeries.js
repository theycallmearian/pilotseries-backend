require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const csv = require('csv-parser')
const Serie = require('../models/Serie')
const path = require('path')

const MONGODB_URI = process.env.MONGO_URI

const readCSV = (filepath) =>
  new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(filepath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })

async function seed() {
  await mongoose.connect(MONGODB_URI)
  await Serie.deleteMany()
  const csvPath = path.resolve(__dirname, '../../data_series.csv')
  const seriesData = await readCSV(csvPath)

  const validSeries = seriesData.filter((s) => {
    const key = Object.keys(s).find((k) => k.trim() === 'Serie')
    return key && s[key] && s[key].trim() !== ''
  })

  if (validSeries.length === 0) {
    console.log('No se insertó ninguna serie. Revisa el CSV.')
    process.exit()
  }

  const keySerie = Object.keys(validSeries[0]).find((k) => k.trim() === 'Serie')
  const keyUrl = Object.keys(validSeries[0]).find(
    (k) => k.trim() === 'URL Imagen'
  )
  const keyDesc = Object.keys(validSeries[0]).find(
    (k) => k.trim() === 'Descripción'
  )
  const keyPlat = Object.keys(validSeries[0]).find(
    (k) => k.trim() === 'Plataforma'
  )
  const keyTipo = Object.keys(validSeries[0]).find((k) => k.trim() === 'Tipo')
  const keyRating = Object.keys(validSeries[0]).find(
    (k) => k.trim() === 'Rating Promedio'
  )

  const docs = await Serie.insertMany(
    validSeries.map((s) => ({
      serie: s[keySerie],
      urlImagen: s[keyUrl],
      descripcion: s[keyDesc],
      plataforma: s[keyPlat],
      tipo: s[keyTipo],
      ratingPromedio: parseFloat(s[keyRating]) || 0
    }))
  )
  console.log('Series insertadas:', docs.length)
  process.exit()
}

seed()
