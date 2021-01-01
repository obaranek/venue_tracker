const User = require('../models/user');
const Venue = require('../models/venue');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

const getVenueByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithVenue;
  try {
    userWithVenue = await User.findById(userId).populate('venue');
  } catch (err) {
    const error = new HttpError('Could not retrieve venue, try again later', 500);
    return next(error);
  }
  if (!userWithVenue) {
    const error = new HttpError('Could not find user', 404);
    return next(error);
  }

  console.log(userWithVenue.venue);
  if (!userWithVenue) {
    res.json({ venue: null });
  } else {
    res.json({ venue: userWithVenue.venue.toObject({ getters: true }) });
  }
}

const createVenue = async (req, res, next) => {
  const { name, address } = req.body;
  let coordinates;

  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(err);
  }

  const createdVenue = new Venue({
    name,
    address,
    coordinates,
    visitors: []
  })


  try {
    await createdVenue.save();
  } catch (err) {
    const error = HttpError('Could not create venue, try again later', 500);
    return next(error);
  }

  res
    .status(201)
    .json({ venue: createdVenue });
}

exports.getVenueByUserId = getVenueByUserId;
exports.createVenue = createVenue;
