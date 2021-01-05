const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const venuesControllers = require('../controllers/venues-controllers');
//const checkAuth = require('../middleware/check-auth');

router.get('/', venuesControllers.getVenues);

//router.use(checkAuth);

router.get('/:uid', venuesControllers.getVenueByUserId);

router.get('/:vid/followers', venuesControllers.getFollowers);

router.get('/:vid/nearby', venuesControllers.getNearbyVenues);

router.post('/create',
  [
    check('name')
      .not()
      .isEmpty(),
    check('address')
      .not()
      .isEmpty(),
    check('max')
      .not()
      .isEmpty()
      .isNumeric()
  ],
  venuesControllers.createVenue
);

router.post('/:uid/enter', venuesControllers.enterVenue);

router.post('/:uid/leave', venuesControllers.leaveVenue);

router.post('/:uid/follow', venuesControllers.followVenue);

router.post('/:uid/unfollow', venuesControllers.unfollowVenue);

// router.delete('/:vid');

module.exports = router;
