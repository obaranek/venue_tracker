const express = require('express');

const venuesControllers = require('../controllers/venues-controllers');

const router = express.Router();


/*
 * returns a JSON object with the the venue the current user is at
*/
// router.get('/users/uid', venuesControllers.getVenueByUserId);

// /*
//  * returns a JSON object with the nearby venues if an address is given
//  * otherwise returns all the venues
// */
// router.get('/', venuesControllers.getVenuesByLocation);

// /*
//  *Creates a venue
// */
// router.post('/', venuesControllers.createVenue);

// /*
//  * deletes the venue associated with the given id
// */
// router.delete('/:vid');

module.exports = router;
