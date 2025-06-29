const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/authController')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

router.post('/register', upload.single('imagen'), register)
router.post('/login', login)

module.exports = router
