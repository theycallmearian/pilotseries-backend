const Review = require('../models/Review')
const Serie = require('../models/Serie')

exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('usuario', 'nombre email imagen')
      .populate('serie', 'serie urlImagen plataforma tipo')
    const reviewsConUsuario = reviews.filter((r) => r.usuario)
    res.json(reviewsConUsuario)
  } catch (err) {
    next(err)
  }
}

exports.getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('usuario', 'nombre email imagen')
      .populate('serie', 'serie urlImagen plataforma tipo')
    if (!review)
      return res.status(404).json({ message: 'Review no encontrada' })
    if (!review.usuario) {
      return res
        .status(404)
        .json({ message: 'Usuario eliminado para esta review' })
    }
    res.json(review)
  } catch (err) {
    next(err)
  }
}

exports.getReviewsBySerie = async (req, res, next) => {
  try {
    const reviews = await Review.find({ serie: req.params.serieId }).populate(
      'usuario',
      'nombre email imagen'
    )
    const reviewsConUsuario = reviews.filter((r) => r.usuario)
    res.json(reviewsConUsuario)
  } catch (err) {
    next(err)
  }
}

exports.getReviewsByUser = async (req, res, next) => {
  try {
    const reviews = await Review.find({ usuario: req.params.userId }).populate(
      'serie',
      'serie urlImagen plataforma tipo'
    )
    res.json(reviews)
  } catch (err) {
    next(err)
  }
}

exports.createReview = async (req, res) => {
  try {
    const { comentario, rating } = req.body
    const serieId = req.params.serieId
    const userId = req.user._id

    const yaExiste = await Review.findOne({ usuario: userId, serie: serieId })
    if (yaExiste) {
      return res.status(400).json({ message: 'Solo una reseña por serie' })
    }

    const review = new Review({
      serie: serieId,
      usuario: userId,
      comentario,
      rating
    })
    await review.save()
    await review.populate('usuario', 'nombre imagen')
    await recalcularRatingPromedio(serieId)
    res.status(201).json({ review })
  } catch (e) {
    res
      .status(500)
      .json({ message: 'No se pudo agregar la reseña', error: e.message })
  }
}

exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) return res.status(404).json({ message: 'Review no encontrada' })
  if (
    String(review.usuario) !== String(req.user._id) &&
    req.user.rol !== 'admin'
  )
    return res.status(403).json({ message: 'Sin permiso' })
  const serieId = review.serie
  await review.deleteOne()
  await recalcularRatingPromedio(serieId)
  res.json({ success: true })
}

exports.likeReview = async (req, res, next) => {
  try {
    const userId = req.user.id
    const review = await Review.findById(req.params.id)
    if (!review)
      return res.status(404).json({ message: 'Review no encontrada' })

    if (!Array.isArray(review.likes)) {
      review.likes = []
    }

    const idx = review.likes.map(String).indexOf(String(userId))
    let liked
    if (idx === -1) {
      review.likes.push(userId)
      liked = true
    } else {
      review.likes.splice(idx, 1)
      liked = false
    }
    await review.save()
    res.json({
      likes: review.likes,
      liked,
      reviewId: review._id
    })
  } catch (err) {
    next(err)
  }
}
exports.updateReview = async (req, res, next) => {
  try {
    const { comentario, rating } = req.body
    const review = await Review.findById(req.params.id)
    if (!review)
      return res.status(404).json({ message: 'Review no encontrada' })
    if (
      String(review.usuario) !== String(req.user.id) &&
      req.user.rol !== 'admin'
    ) {
      return res.status(403).json({ message: 'No autorizado' })
    }

    if (comentario !== undefined) review.comentario = comentario
    if (rating !== undefined) review.rating = rating

    await review.save()
    await recalcularRatingPromedio(review.serie)

    res.json({
      _id: review._id,
      comentario: review.comentario,
      rating: review.rating
    })
  } catch (err) {
    next(err)
  }
}

async function recalcularRatingPromedio(serieId) {
  const reviews = await Review.find({ serie: serieId })
  if (reviews.length === 0) {
    await Serie.findByIdAndUpdate(serieId, { ratingPromedio: 0 })
    return
  }
  const suma = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
  const promedio = suma / reviews.length
  await Serie.findByIdAndUpdate(serieId, { ratingPromedio: promedio })
}
