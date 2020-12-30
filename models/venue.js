const mongoose = require('mongoose');

const Schema = { mongoose };

const venueSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  visitors: [{ type: mongoose.Types.ObjectId, ref: 'User' }]
})

module.exports = mongoose.model('Venue', venueSchema);
