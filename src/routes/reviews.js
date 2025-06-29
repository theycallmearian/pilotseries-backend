const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/reviewController')
const { auth } = require('../middlewares/auth')

router.get('/', ctrl.getAllReviews)

router.get('/:id', ctrl.getReviewById)

router.get('/serie/:serieId', ctrl.getReviewsBySerie)

router.get('/user/:userId', ctrl.getReviewsByUser)

router.post('/:serieId', auth, ctrl.createReview)

router.put('/:id', auth, ctrl.updateReview)

router.delete('/:id', auth, ctrl.deleteReview)

router.post('/:id/like', auth, ctrl.likeReview)

module.exports = router
