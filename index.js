const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const bodyParser = require('body-parser');
const clientRouter = require('./routes/clients');
const adminRouter = require('./routes/admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Define a router object
const router = express.Router();

// Redirect from "/" to "/client"
router.get('/', async (req, res, next) => {
  res.redirect('/client');
});

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Mount routers
app.use(router);
app.use('/client', clientRouter);
app.use('/admin', adminRouter);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
