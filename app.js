const venuesRoutes = require('./routes/venueRoutes');
const usersRoutes = require('./routes/usersRoutes')

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const HttpError = require('./models/http-error');

const app = express();

const databaseUrl = 'mongodb+srv://obaranek:venuetrackerpass@cluster0.kja56.mongodb.net/VenueTracker?retryWrites=true&w=majority';

app.use(bodyParser.json());

app.use('/api/venues', venuesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route', 404);
  throw error;
});

app.use((error, req, res, next) => {
  res.json({ message: error.message || 'An unknown error occured' });
});

mongoose.connect(databaseUrl)
  .then(() => {
    app.listen(5000);
  }).catch((err) => {
    console.log(err);
  });
