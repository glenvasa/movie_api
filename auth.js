/**
 * Same key used in JWT strategy
 */
const jwtSecret = 'your_jwt_secret'; 

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); 

/**
 * Function to generate token, set expiration date, and algorithm used to
 * "sign" or encode the values of the JWT Strategy
 * @param user 
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, 
    expiresIn: '7d', 
    algorithm: 'HS256' 
  });
};

/**
 * api call to login endpoint which authenticates user after entering credentials
 * @param router 
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false}, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
