const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema(
  {
    serie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Serie',
      required: true
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comentario: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
    fecha: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Review', ReviewSchema)
