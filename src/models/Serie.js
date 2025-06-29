const mongoose = require('mongoose')

const SerieSchema = new mongoose.Schema(
  {
    serie: { type: String, required: true },
    urlImagen: { type: String },
    descripcion: { type: String },
    plataforma: { type: String },
    tipo: { type: String },
    ratingPromedio: { type: Number, default: 0 },
    seguidores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Serie', SerieSchema)
