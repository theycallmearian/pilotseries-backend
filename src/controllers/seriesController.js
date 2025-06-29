const Serie = require('../models/Serie')
const User = require('../models/User')
const Review = require('../models/Review')
const cloudinary = require('../config/cloudinary')
const fs = require('fs')

exports.getAllSeries = async (req, res, next) => {
  try {
    const series = await Serie.find()
    res.json(series)
  } catch (err) {
    next(err)
  }
}

exports.createSerie = async (req, res, next) => {
  try {
    const { serie, urlImagen, descripcion, plataforma, tipo } = req.body
    let img = urlImagen
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'pilotseries/series',
        resource_type: 'image'
      })
      img = result.secure_url
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error borrando archivo local:', err)
      })
    }
    const newSerie = new Serie({
      serie,
      urlImagen: img,
      descripcion,
      plataforma,
      tipo,
      ratingPromedio: 0,
      seguidores: []
    })
    await newSerie.save()
    res.status(201).json(newSerie)
  } catch (err) {
    next(err)
  }
}

exports.updateSerie = async (req, res, next) => {
  try {
    const updates = { ...req.body }
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'pilotseries/series',
        resource_type: 'image'
      })
      updates.urlImagen = result.secure_url
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error borrando archivo local:', err)
      })
    }
    const serie = await Serie.findByIdAndUpdate(req.params.id, updates, {
      new: true
    })
    if (!serie) return res.status(404).json({ message: 'Serie no encontrada' })
    res.json(serie)
  } catch (err) {
    next(err)
  }
}

exports.deleteSerie = async (req, res, next) => {
  try {
    const serie = await Serie.findByIdAndDelete(req.params.id)
    if (!serie) return res.status(404).json({ message: 'Serie no encontrada' })
    res.json({ message: 'Serie eliminada' })
  } catch (err) {
    next(err)
  }
}

exports.rateSerie = async (req, res, next) => {
  try {
    const { rating } = req.body
    const serie = await Serie.findById(req.params.id)
    if (!serie) return res.status(404).json({ message: 'Serie no encontrada' })
    if (!serie.ratings) serie.ratings = []
    const existing = serie.ratings.find(
      (r) => r.userId?.toString() === req.user.id
    )
    if (existing) {
      existing.rating = rating
    } else {
      serie.ratings.push({ userId: req.user.id, rating })
    }
    const sum = serie.ratings.reduce((acc, r) => acc + r.rating, 0)
    serie.ratingPromedio = serie.ratings.length ? sum / serie.ratings.length : 0
    await serie.save()
    res.json(serie)
  } catch (err) {
    next(err)
  }
}
exports.followSerie = async (req, res, next) => {
  try {
    const serie = await Serie.findById(req.params.id)
    const user = await User.findById(req.user.id)
    if (!serie || !user)
      return res.status(404).json({ message: 'Serie o usuario no encontrado' })
    if (!serie.seguidores.includes(req.user.id)) {
      serie.seguidores.push(req.user.id)
      await serie.save()
    }
    if (!user.seguimientoSeries.includes(serie._id)) {
      user.seguimientoSeries.push(serie._id)
      await user.save()
    }
    const updatedUser = await User.findById(user._id)
      .populate('favoritosSeries')
      .populate('seguimientoSeries')
      .populate('seriesFinalizadas')
    res.json(updatedUser)
  } catch (err) {
    next(err)
  }
}

exports.unfollowSerie = async (req, res, next) => {
  try {
    const serie = await Serie.findById(req.params.id)
    const user = await User.findById(req.user.id)
    if (!serie || !user)
      return res.status(404).json({ message: 'Serie o usuario no encontrado' })
    serie.seguidores = serie.seguidores.filter(
      (id) => id.toString() !== req.user.id
    )
    await serie.save()
    user.seguimientoSeries = user.seguimientoSeries.filter(
      (id) => id.toString() !== req.params.id
    )
    await user.save()
    const updatedUser = await User.findById(user._id)
      .populate('favoritosSeries')
      .populate('seguimientoSeries')
      .populate('seriesFinalizadas')
    res.json(updatedUser)
  } catch (err) {
    next(err)
  }
}

exports.favoriteSerie = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user.favoritosSeries.includes(req.params.id)) {
      user.favoritosSeries.push(req.params.id)
      await user.save()
    }
    const updatedUser = await User.findById(user._id)
      .populate('favoritosSeries')
      .populate('seguimientoSeries')
      .populate('seriesFinalizadas')
    res.json(updatedUser)
  } catch (err) {
    next(err)
  }
}
exports.unfavoriteSerie = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    user.favoritosSeries = user.favoritosSeries.filter(
      (id) => id.toString() !== req.params.id
    )
    await user.save()
    const updatedUser = await User.findById(user._id)
      .populate('favoritosSeries')
      .populate('seguimientoSeries')
      .populate('seriesFinalizadas')
    res.json(updatedUser)
  } catch (err) {
    next(err)
  }
}

exports.finishSerie = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user.seriesFinalizadas.includes(req.params.id)) {
      user.seriesFinalizadas.push(req.params.id)
      await user.save()
    }
    const updatedUser = await User.findById(user._id)
      .populate('favoritosSeries')
      .populate('seguimientoSeries')
      .populate('seriesFinalizadas')
    res.json(updatedUser)
  } catch (err) {
    next(err)
  }
}

exports.unfinishSerie = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    user.seriesFinalizadas = user.seriesFinalizadas.filter(
      (id) => id.toString() !== req.params.id
    )
    await user.save()
    const updatedUser = await User.findById(user._id)
      .populate('favoritosSeries')
      .populate('seguimientoSeries')
      .populate('seriesFinalizadas')
    res.json(updatedUser)
  } catch (err) {
    next(err)
  }
}

exports.getSerieById = async (req, res, next) => {
  try {
    const serie = await Serie.findById(req.params.id)
      .populate('seguidores', 'nombre imagen')
      .lean()
    if (!serie) return res.status(404).json({ message: 'No encontrada' })
    res.json(serie)
  } catch (e) {
    res.status(500).json({ message: 'Error cargando serie', error: e.message })
  }
}

exports.addReview = async (req, res) => {
  try {
    const { comentario, rating } = req.body
    const serieId = req.params.id
    const userId = req.user._id

    if (typeof comentario !== 'string' || comentario.trim().length === 0) {
      return res.status(400).json({ message: 'Comentario requerido' })
    }
    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      return res.status(400).json({ message: 'Puntuación inválida' })
    }

    const review = new Review({
      serie: serieId,
      usuario: userId,
      comentario,
      rating
    })
    await review.save()
    await review.populate('usuario', 'nombre imagen')

    res.status(201).json({ review })
  } catch (e) {
    res
      .status(500)
      .json({ message: 'No se pudo agregar la reseña', error: e.message })
  }
}
