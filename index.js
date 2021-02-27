const express = require("express");
morgan = require("morgan");
mongoose = require("mongoose");
Models = require("./models.js");
bodyParser = require("body-parser");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use(morgan("common"));

app.use(express.static("public"));

app.use(bodyParser.json());

const passport = require("passport");
require("./passport");

const cors = require("cors");

let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "http://localhost:4200",
  "https://myflix2020.netlify.app",
  "https://glenvasa.github.io",
];

const { check, validationResult } = require("express-validator");

/**
 * cors blocks request from origins not specifically included in
 * allowedOrigins array
 */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn't allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

/**
 * API calls below are explained in detail at
 * https://myflix2020.herokuapp.com/documentation.html
 */

/**
 * imports auth.js containing api call to login endpoint and authentication
 */
let auth = require("./auth")(app);

/**
 * api call to homepage
 */
app.get("/", (req, res) => {
  console.log("hello");
  res.send("Welcome to myFlix!");
});

/**
 * api call to retrieve all movies data
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * api call to get all users data
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * api call to get data about a single movie by title
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.status(201).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * api call to get data about a genre by movie title
 */
app.get(
  "/movies/Genres/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res
          .status(201)
          .json(
            "Genre: " +
              movie.Genre.Name +
              ". Description: " +
              movie.Genre.Description
          );
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * api call to get data about a director by name
 */
app.get(
  "/movies/Directors/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then((movie) => {
        res
          .status(201)
          .json(
            "Name: " +
              movie.Director.Name +
              ". Bio: " +
              movie.Director.Bio +
              " Birth: " +
              movie.Director.Birth +
              ". Death: " +
              movie.Director.Death +
              "."
          );
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * api call to create a new user registration
 */
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthdate: req.body.Birthdate,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * api call to get data about a single user by username
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * api call to change user data information by username
 */
app.put(
  "/users/:Username",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthdate: req.body.Birthdate,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.status(201).json(updatedUser);
        }
      }
    );
  }
);

/**
 * api call to post a new movie to user's list of favorite movies
 */
app.post(
  "/users/:Username/Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieID } },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.status(201).json(updatedUser);
        }
      }
    );
  }
);

/**
 * api call to delete a movie from user's list of favorite movies
 */
app.delete(
  "/users/:Username/Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * api call to delete a user from user collection in database
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({
      Username: req.params.Username,
    })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res
            .status(200)
            .send(
              req.params.Username +
                " was successfully deregistered from myFlix."
            );
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
