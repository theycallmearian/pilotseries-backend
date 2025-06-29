const jwt = require('jsonwebtoken')
const User = require('../models/User')
const cloudinary = require('../config/cloudinary')
const fs = require('fs')

exports.register = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body
    if (!nombre || !email || !password)
      return res.status(400).json({ message: 'Faltan datos obligatorios' })
    if (!password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/))
      return res.status(400).json({ message: 'Contraseña insegura.' })

    let user = await User.findOne({ email })
    if (user) return res.status(400).json({ message: 'Email ya registrado' })

    let imagenUrl = User.schema.path('imagen').defaultValue
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'pilotseries/usuarios',
        resource_type: 'image'
      })
      imagenUrl = result.secure_url
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error borrando archivo local:', err)
      })
    }

    user = new User({
      nombre,
      email,
      password,
      rol: 'usuario',
      imagen: imagenUrl
    })
    await user.save()

    const token = jwt.sign(
      { id: user._id, role: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    res.status(201).json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        imagen: user.imagen
      }
    })
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' })
    }

    const user = await User.findOne({ email })

    if (!user)
      return res.status(400).json({ message: 'Credenciales inválidas' })

    if (user.baneado)
      return res
        .status(403)
        .json({ message: 'Usuario baneado. Escribe al admin@pilotseries.com' })

    const isMatch = await user.comparePassword(password)

    if (!isMatch)
      return res.status(400).json({ message: 'Credenciales inválidas' })

    const token = jwt.sign(
      { id: user._id, role: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        imagen: user.imagen
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
