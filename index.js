const express = require('express');
  morgan = require('morgan');
  mongoose = require('mongoose');
  Models = require('./models.js');
  bodyParser = require('body-parser');


const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true});

const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

app.use(bodyParser.json());

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

// Get a list of data about all movies
app.get('/movies', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Get a list of Users
// app.get('/users', passport.authenticate('jwt', { session: false}), (req, res) => {
//   Users.find()
//   .then((users) => {
//     res.status(201).json(users);
//   })
//   .catch((err) => {
//     console.error(err);
//     res.status(500).send('Error: ' + err);
//   });
// });

// Get data about a single movie, by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title})
    .then((movie) => {
      res.status(201).json(movie);
 })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
 });
});

// Get data about a genre by title
app.get('/movies/Genres/:Title', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne({ Title : req.params.Title})
    .then((movie) => {
      res.status(201).json("Genre: "+ movie.Genre.Name + ". Descripton: " + movie.Genre.Description);
 })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
 });
});

// Get data about a director by name
app.get('/movies/Directors/:Name', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne({ "Director.Name" : req.params.Name})
    .then((movie) => {
      res.status(201).json("Name: "+ movie.Director.Name + ". Bio: " + movie.Director.Bio + " Birth: " + movie.Director.Birth + ". Death: " + movie.Director.Death + ".");
 })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
 });
});


// Post new user registration
app.post('/users', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
    } else {
      Users
      .create({
       Username: req.body.Username,
       Password: req.body.Password,
       Email: req.body.Email,
       Birthdate: req.body.Birthdate
    })
    .then((user) => {res.status(201).json(user);})
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
    });
  }
})
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
  });
});

//Get data about a single user by Username
// app.get('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
//   Users.findOne({ Username: req.params.Username })
//     .then((user) => {
//       res.json(user);
//   })
//   .catch((err) => {
//     console.error(err);
//     res.status(500).send('Error: ' + err);
//   });
// });

// Put updates to user information
app.put('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username},
    { $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthdate: req.body.Birthdate
      }
    },
    {new: true},
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.status(201).json(updatedUser);
      }
    });
  });

// Post new movie to user list of favorite movies
app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate(
      {Username: req.params.Username},
      {$push: { FavoriteMovies : req.params.MovieID}
    },
     {new : true },
     (err, updatedUser) => {
       if (err) {
         console.error(err);
         res.status(500).send('Error: '  + err);
      } else {
        res.status(201).json(updatedUser);
      }
    });
  });

// Delete a movie from list of user's favorite movies
app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username},
      { $pull: { FavoriteMovies: req.params.MovieID}
    },
    {new: true},
     (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
     } else {
       res.json(updatedUser);
     }
   });
 });

// Deletes a user from registration database
app.delete('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndRemove({
    Username: req.params.Username
  })
   .then((user) => {
     if (!user) {
       res.status(400).send(req.params.Username + ' was not found.');
  } else {
        res.status(200).send(req.params.Username + ' was successfully deregistered from myFlix.');
  }
})
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(8080, () =>
  console.log('Your app is listening on port 8080.'));
