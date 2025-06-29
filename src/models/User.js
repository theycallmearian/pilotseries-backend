const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },
    imagen: {
      type: String,
      default:
        'https://res.cloudinary.com/dye4qdrys/image/upload/v1750485096/pilotseries/logo_favicon/logo.png'
    },
    baneado: { type: Boolean, default: false },
    favoritosSeries: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Serie', default: [] }
    ],
    seguimientoSeries: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Serie', default: [] }
    ],
    seriesFinalizadas: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Serie', default: [] }
    ]
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)
