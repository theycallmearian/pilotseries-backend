const express = require('express')
const router = express.Router()
const {
  getUsers,
  getMe,
  updateMe,
  banUser,
  unbanUser,
  getSerieEstado,
  addFavorita,
  removeFavorita,
  addSeguimiento,
  removeSeguimiento,
  addFinalizada,
  removeFinalizada,
  getMyFavorites,
  getMyFollowing,
  getMyCompleted,
  getRecommendations,
  deleteOwnUser,
  deleteUser
} = require('../controllers/usersController')
const { auth, isAdmin } = require('../middlewares/auth')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

router.get('/', auth, isAdmin, getUsers)

router.get('/me', auth, getMe)

router.get('/me/series/:serieId/estado', auth, getSerieEstado)

router.put('/me', auth, upload.single('imagen'), updateMe)

router.post('/me/favorita/:serieId', auth, addFavorita)
router.delete('/me/favorita/:serieId', auth, removeFavorita)

router.post('/me/seguimiento/:serieId', auth, addSeguimiento)
router.delete('/me/seguimiento/:serieId', auth, removeSeguimiento)

router.post('/me/finalizada/:serieId', auth, addFinalizada)
router.delete('/me/finalizada/:serieId', auth, removeFinalizada)

router.put('/:id/ban', auth, isAdmin, banUser)
router.put('/:id/unban', auth, isAdmin, unbanUser)

router.get('/me/favorita', auth, getMyFavorites)
router.get('/me/seguimiento', auth, getMyFollowing)
router.get('/me/finalizada', auth, getMyCompleted)

router.get('/:id/recommendations', auth, getRecommendations)

router.delete('/me', auth, deleteOwnUser)
router.delete('/:id', auth, isAdmin, deleteUser)

module.exports = router
