const mongoose = require('mongoose');

const { Schema } = mongoose;

const venueSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: { type: String },
    coordinates: []
  },
  visitors: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  max: { type: Number, required: true }
})

venueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Venue', venueSchema);
