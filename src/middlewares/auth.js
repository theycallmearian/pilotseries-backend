const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token)
    return res
      .status(401)
      .json({ message: 'No token. Autenticación requerida.' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user || user.baneado)
      return res
        .status(401)
        .json({ message: 'No autorizado o usuario baneado.' })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido.' })
  }
}

exports.isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin')
    return res.status(403).json({ message: 'Acceso solo para admins.' })
  next()
}
