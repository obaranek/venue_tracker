const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const User = require('../models/user');
const Venue = require('../models/venue');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const mailer = require('../util/mailer');

const followVenue = async (req, res, next) => {
  const followerId = req.params.uid;
  const venueId = req.body.venue;

  let follower;
  try {
    follower = await User.findById(followerId);
  } catch (err) {
    const error = HttpError('Could not follow the given user, try again later', 500);
    next(error);
  }

  if (!follower) {
    const error = HttpError('Could not follow the given user.', 404);
    return next(error);
  }

  let following;
  try {
    following = await Venue.findById(venueId);
  } catch (err) {
    const error = new HttpError('Could not follow the given user, try again later', 500);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    follower.followings.push(following);
    following.followers.push(follower);
    await following.save({ session: sess });
    await follower.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('Following failed, please try again', 500);
    return next(error);
  }
  res.status(201).json({ msg: 'Success' });
}

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalid input passed, check your data', 422);
    return next(error);
  }

  const { name, address, max } = req.body;
  let coordinates;

  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(err);
  }

  let venueDuplicate;
  try {
    venueDuplicate = await Venue.findOne({ coordinates: coordinates });
  } catch (err) {
    const error = new HttpError('Could not create venue, please try again', 500);
    return next(error);
  }

  if (venueDuplicate) {
    const error = new HttpError('Venue already exits', 500);
    return next(error);
  }

  const createdVenue = new Venue({
    name,
    address,
    coordinates,
    followers: [],
    visitors: [],
    max
  })


  try {
    await createdVenue.save();
  } catch (err) {
    const error = new HttpError('Could not create venue, try again later', 500);
    return next(error);
  }

  res
    .status(201)
    .json({ venue: createdVenue });
}

const enterVenue = async (req, res, next) => {
  const userId = req.params.uid;
  const venueId = req.body.venue;


  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError('Could not submit your request, try again later', 500);
    return next(error);
  }
  if (!user) {
    const error = new HttpError('could not find a user with the given id', 404);
    return next(error);
  }

  let venue;
  try {
    venue = await Venue.findById(venueId).populate('followers');
  } catch (err) {
    const error = new HttpError('Could not submit your request, try again later', 500);
    return next(error);
  }
  if (!venue) {
    const error = new HttpError('Could not find a venue with the given id', 404);
    return next(error);
  }

  if (user.venue) {
    const error = new HttpError('You are already checked in in a venue, please checkout there first', 500);
    return next(error);
  }

  if (venue.visitors.length >= venue.max) {
    const error = new HttpError('This venue is currently is full', 500);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    user.venue = venue.id;
    venue.visitors.push(user);
    await venue.save({ session: sess });
    await user.save({ session: sess })
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('Entering venue failed, please try again', 500);
    return next(error);
  }

  let to = [];
  if (venue.followers.length !== 0) {
    venue.followers.map(follower => follower.id !== userId && to.push(follower.email));
    try {
      const visitorsCount = venue.visitors.length;

      const msg = `
We would like to notify you that ${user.name} just checked in at ${venue.name}.\n
Current availability: ${venue.max - visitorsCount} / ${venue.max}`

      mailer(to.toString(), "Venue Tracker Notification", msg);
    } catch (err) {
      const error = new HttpError('Could not notify your followers, please check-in again', 500);
      next(error);
    }
  }

  res.status(201).json({ msg: `Entering ${venue.name} success` });
}

const leaveVenue = async (req, res, next) => {
  const userId = req.params.uid;
  const venueId = req.body.venue;


  let user;
  try {
    user = await User.findById(userId).populate('venue');
  } catch (err) {
    const error = new HttpError('Could not submit your request, try again later', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('could not find a user with the given id', 404);
    return next(error);
  }

  let venue;
  try {
    venue = await Venue.findById(venueId).populate('followers');
  } catch (err) {
    const error = new HttpError('Could not submit your request, try again later', 500);
    return next(error);
  }
  if (!venue) {
    const error = new HttpError('Could not find a venue with the given id', 404);
    return next(error);
  }

  if (!user.venue || user.venue.id !== venueId) {
    const error = new HttpError('You are not checked in in this venue', 500);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    user.venue = null;
    venue.visitors.pull(user);
    await venue.save({ session: sess });
    await user.save({ session: sess })
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('Entering venue failed, please try again', 500);
    return next(error);
  }

  let to = [];
  if (venue.followers.length !== 0) {
    venue.followers.map(follower => follower.id !== userId && to.push(follower.email));
    try {
      const visitorsCount = venue.visitors.length;

      const msg = `
We would like to notify you that ${user.name} just checked out at ${venue.name}.\n
Current availability: ${venue.max - visitorsCount} / ${venue.max}`

      mailer(to.toString(), "Venue Tracker Notification", msg);
    } catch (err) {
      const error = new HttpError('Could not notify your followers', 500);
      next(error);
    }
  }

  res.status(201).json({ msg: `Leaving ${venue.name} success` });
}

/* getFollowers */
const getFollowers = async (req, res, next) => {
  const venueId = req.params.vid;

  let venueWithFollowers;
  try {
    venueWithFollowers = await Venue.findById(venueId).populate('followers');
  } catch (err) {
    const error = new HttpError('Fetching followers failed, please try again later', 500);
    return next(error);
  }

  if (!venueWithFollowers || venueWithFollowers.followers.length === 0) {
    const error = new HttpError('No followers found for this venue');
    return next(error);
  }

  res.json({ followers: venueWithFollowers.followers.map(follower => follower.toObject({ getters: true })) })
}


exports.getVenueByUserId = getVenueByUserId;
exports.createVenue = createVenue;
exports.enterVenue = enterVenue;
exports.getFollowers = getFollowers;
exports.leaveVenue = leaveVenue;
exports.followVenue = followVenue;
