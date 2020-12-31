const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const usersControllers = require('../controllers/users-controllers');
const checkAuth = require('../middleware/check-auth');


/*
 * creates a user
 * return a JSON object with the user details
*/
router.post('/signup',
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersControllers.signup);

/*
 * logs a user in
*/
router.post('/login', usersControllers.login);


/*
 * returns a JSON object populated with all the follwers associated with a user ID
*/
router.get('/:uid/followers', usersControllers.getFollowers);

/*
 * returns a JSON object populated with all the followings associated with a user ID
*/
router.get('/:uid/followings', usersControllers.getFollowings);

/*
 * returns a JSON object populated by all the users
*/
router.get('/', usersControllers.getUsers);


/*
 * check authentication
 */
router.use(checkAuth);

/*
 * requires a user ID to follow
 * updates the list of followings of the given uid by adding user ID to the list
*/
router.post('/:uid/follow', usersControllers.followUser);

// /*
//  * updates the venue of the user with the associated id
//  * returns a JSON object of the updated user details
// */
// router.patch('/venue/uid', usersControllers.updateVenue);


// /*
//  * deletes a user
// */
// router.delete('/uid')

module.exports = router;
