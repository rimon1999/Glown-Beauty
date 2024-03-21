const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const usersRouter = require('./routes/clients');
require('dotenv').config(); // Load environment variables from .env file




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Set the directory where your views will be stored


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
