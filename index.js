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

app.get('/movies', (req, res) => {
  res.json(topTenMovies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(8080, () =>
  console.log('Your app is listening on port 8080.'));
