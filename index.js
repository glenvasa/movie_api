const express = require('express');
  morgan = require('morgan');

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
  res.send('Successful GET request returning data on all movies');
 });

// Get data about a single movie, by title
app.get('/movies/:title', (req, res) => {
  res.send('Successful GET request returning data on movie title: ' + req.params.title);
 });

// Get data about a genre by title
app.get('/movies/genres/:genre', (req, res) => {
  res.send('Successful GET request returning data on genre: ' + req.params.genre);
 });

// Get data about a director by name
app.get('/movies/directors/:name', (req, res) => {
  res.send('Successful GET request returning data on director: ' + req.params.name);
});

// Post new user registration
app.post('/users', (req, res) => {
  res.send('Successful POST request registering new user');
});

// Put updates to user information
app.put('/users/:username', (req, res) => {
  res.send('Successful PUT request updating information for user: ' + req.params.username);
});

// Post new movie to user list of favorite movies
app.post('/users/:username/movies/:movieID', (req, res) => {
  res.send('Successful POST request adding movie with ID: ' + req.params.movieID + ' to favorite movie list of User: ' + req.params.username);
});

// Delete a movie from list of user's favorite movies
app.delete('/users/:username/movies/:movieID', (req, res) => {
  res.send('Successful DELETE request removing movie with ID: ' + req.params.movieID + ' from favorite movie list of User: ' + req.params.username);
});

// Deletes a user from registration database
app.delete('/users/:username', (req, res) => {
  res.send('Successful DELETE request removing User: ' + req.params.username + ' from database');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(8080, () =>
  console.log('Your app is listening on port 8080.'));
