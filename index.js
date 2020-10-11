const express = require('express');
  morgan = require('morgan');
  mongoose = require('mongoose');
  Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true});

const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

let topTenMovies = [
  {
    title: 'The Godfather',
    cast: 'Marlon Brando, Al Pacino, James Caan, Robert Duvall, Diane Keaton, Talia Shire'
  },
  {
    title: 'The Wizard of Oz',
    cast: 'Judy Garland, Frank Morgan, Ray Bolger, Bert Lahr, Jack Haley'
  },
  {
    title: 'Citizen Kane',
    cast: 'Orson Welles, Joseph Cotten, Dorothy Comingore, Agnes Moorehead, Ruth Warrick'
  },
  {
    title: 'The Shawshank Redemption',
    cast: 'Tim Robbins, Morgan Freeman'
  },
  {
    title: 'Pulp Fiction',
    cast: 'John Travolta, Uma Thurman, Samuel L. Jackson, Bruce Willis, Ving Rhames'
  },
  {
    title: 'Casablanca',
    cast: 'Humphrey Bogart, Ingrid Bergman'
  },
  {
    title: 'The Godfather: Part II',
    cast: 'Al Pacino, Robert De Niro, Robert Duvall, Diane Keaton'
  },
  {
    title: 'E.T. The Extra-Terrestrial',
    cast: 'Henry Thomas, Drew Barrymore, Dee Wallace'
  },
  {
    title: '2001: A Space Odyssey',
    cast: 'Keir Dullea, Gary Lockwood, William Sylvester'
  },
  {
    title: "Schindler's List",
    cast: 'Liam Neeson, Ralph Fiennes, Ben Kingsley'
  },
];

app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

// Get a list of data about all movies
app.get('/movies', (req, res) => {
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
app.get('/users', (req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Get data about a single movie, by title
app.get('/movies/:Title', (req, res) => {
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
app.get('/movies/Genres/:Title', (req, res) => {
  Movies.findOne({ Title : req.params.Title})
    .then((movie) => {
      res.status(201).json(movie.Genre.Name + ". " + movie.Genre.Description);
 })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
 });
});

// Get data about a director by name
app.get('/movies/Directors/:Name', (req, res) => {
  Movies.findOne({ "Director.Name" : req.params.Name})
    .then((movie) => {
      res.status(201).json(movie.Director.Name + ': ' + movie.Director.Bio);
 })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
 });
});


// Post new user registration
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
    } else {
      Users.create
    ({ Username: req.body.Username,
       Password: req.body.Password,
       Email: req.body.Email,
       Birthdate: req.body.Birthdate
    }) .then((user) => {
          res.status(201).json(user);
      })
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
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Put updates to user information
app.put('/users/:Username', (req, res) => {
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
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username/Movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({
    Username: req.params.Username
  })
   .then((user) => {
     if (!user) {
       res.status(400).send(req.params.Username + ' was not found.');
  } else {
        res.status(200).send(req.params.Username + ' was deleted.');
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
