const User = require('../models/User')
const Serie = require('../models/Serie')
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const cloudinary = require('../config/cloudinary')

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (err) {
    next(err)
  }
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favoritosSeries')
      .populate('seguimientoSeries')
      .populate('seriesFinalizadas')
      .select('-password')
    res.json(user)
  } catch (err) {
    next(err)
  }
}

exports.getSerieEstado = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const serieId = req.params.serieId
    res.json({
      favorita: (user.favoritosSeries || []).some((id) => id.equals(serieId)),
      seguimiento: (user.seguimientoSeries || []).some((id) =>
        id.equals(serieId)
      ),
      finalizada: (user.seriesFinalizadas || []).some((id) =>
        id.equals(serieId)
      ),
      loading: false
    })
  } catch (err) {
    next(err)
  }
}

exports.addFavorita = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const serieId = req.params.serieId
    if (!user.favoritosSeries.map(String).includes(serieId.toString())) {
      user.favoritosSeries.push(serieId)
    }
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

exports.removeFavorita = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const serieId = req.params.serieId
    user.favoritosSeries = user.favoritosSeries.filter(
      (id) => id.toString() !== serieId
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

exports.addSeguimiento = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const serieId = req.params.serieId
    if (!user.seguimientoSeries.map(String).includes(serieId.toString())) {
      user.seguimientoSeries.push(serieId)
    }
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

exports.removeSeguimiento = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const serieId = req.params.serieId
    user.seguimientoSeries = user.seguimientoSeries.filter(
      (id) => id.toString() !== serieId
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

exports.addFinalizada = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const serieId = req.params.serieId
    if (!user.seriesFinalizadas.map(String).includes(serieId.toString())) {
      user.seriesFinalizadas.push(serieId)
    }
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

exports.removeFinalizada = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const serieId = req.params.serieId
    user.seriesFinalizadas = user.seriesFinalizadas.filter(
      (id) => id.toString() !== serieId
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

exports.updateMe = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body
    const user = await User.findById(req.user.id)

    if (nombre) user.nombre = nombre
    if (email) user.email = email
    if (password && password.trim()) {
      user.password = password
    }
    if (req.file) {
      if (
        user.imagen &&
        user.imagen.includes('cloudinary') &&
        !user.imagen.includes('logo')
      ) {
        const parts = user.imagen.split('/')
        const imageName = parts[parts.length - 1].split('.')[0]
        const publicId = 'pilotseries/usuarios/' + imageName
        try {
          await cloudinary.uploader.destroy(publicId)
        } catch (e) {}
      }
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: 'pilotseries/usuarios',
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
      })
      user.imagen = uploadRes.secure_url
      fs.unlinkSync(req.file.path)
    }

    await user.save()
    res.json({ success: true, user: user.toObject() })
  } catch (err) {
    next(err)
  }
}

exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
    user.baneado = true
    await user.save()
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
    user.baneado = false
    await user.save()
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

exports.getMyFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favoritosSeries',
      select:
        'titulo serie imagen urlImagen plataforma rating ratingPromedio tipo'
    })
    res.json(user.favoritosSeries)
  } catch (err) {
    next(err)
  }
}

exports.getMyFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'seguimientoSeries',
      select:
        'titulo serie imagen urlImagen plataforma rating ratingPromedio tipo'
    })
    res.json(user.seguimientoSeries)
  } catch (err) {
    next(err)
  }
}

exports.getMyCompleted = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'seriesFinalizadas',
      select:
        'titulo serie imagen urlImagen plataforma rating ratingPromedio tipo'
    })
    res.json(user.seriesFinalizadas)
  } catch (err) {
    next(err)
  }
}

exports.getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'seguimientoSeries',
      'plataforma tipo'
    )

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    const plataformasSeguidas = [
      ...new Set(
        (user.seguimientoSeries || []).map((s) => s.plataforma).filter(Boolean)
      )
    ]
    const tiposSeguidos = [
      ...new Set(
        (user.seguimientoSeries || []).map((s) => s.tipo).filter(Boolean)
      )
    ]
    const excludeIds = [
      ...user.seriesFinalizadas,
      ...user.seguimientoSeries.map((s) => s._id || s),
      ...user.favoritosSeries
    ].map((id) => id.toString())

    let filtro = { _id: { $nin: excludeIds } }
    if (plataformasSeguidas.length) {
      filtro.plataforma = { $in: plataformasSeguidas }
    }
    if (tiposSeguidos.length) {
      filtro.tipo = { $in: tiposSeguidos }
    }

    const recommendations = await Serie.find(filtro).limit(15)
    res.json(recommendations)
  } catch (err) {
    next(err)
  }
}

exports.deleteOwnUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
