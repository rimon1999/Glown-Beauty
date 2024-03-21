const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const usersRouter = require('./routes/clients');
require('dotenv').config(); // Load environment variables from .env file


app.use('/client', usersRouter);
// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Define routes and middleware here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
