const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const usersRouter = require('./routes/clients');


app.use('/client', usersRouter);
// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://n01514083:admin123@cluster0.fts4zer.mongodb.net/registration', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Define routes and middleware here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
