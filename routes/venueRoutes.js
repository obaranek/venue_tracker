const express = require('express');
const { check } = require('express-validator');

const venuesControllers = require('../controllers/venues-controllers');

const router = express.Router();


router.get('/:uid', venuesControllers.getVenueByUserId);

router.get('/:vid/followers', venuesControllers.getFollowers);

// router.get('/', venuesControllers.getVenuesByLocation);

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

// router.delete('/:vid');

module.exports = router;
