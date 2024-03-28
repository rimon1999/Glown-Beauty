// routes/admin.js

const express = require('express');
const router = express.Router();
const Client = require('../models/client');
const dotenv = require('dotenv'); // Import dotenv

// Load environment variables from .env file
dotenv.config();

// Secret key for accessing the admin page
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

// Middleware to check if the request contains the correct secret key
function isAdminAuthenticated(req, res, next) {
    const secretKey = req.query.key; // assuming the secret key is passed as a query parameter
    if (secretKey === ADMIN_SECRET_KEY) {
        // Authorized, proceed to the next middleware/route handler
        next();
    } else {
        // Unauthorized, return a 403 Forbidden response
        return res.status(403).send('Unauthorized');
    }
}

// Admin page route - Display all bookings
router.get('/', isAdminAuthenticated, async (req, res, next) => {
    try {
        // Retrieve all bookings from the database
        const bookings = await Client.find();
        // Render the admin page with the booking list
        return res.render('admin/adminPage', { bookings ,ADMIN_SECRET_KEY });
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

// Route to delete a booking
router.post('/delete/:id', isAdminAuthenticated, async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        // Delete the booking from the database
        await Client.findByIdAndDelete(bookingId);
        // Redirect back to the admin page after deletion
        res.redirect(`/admin/?key=${ADMIN_SECRET_KEY}`);
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

// Route to edit a booking (render edit form)
router.get('/edit/:id', isAdminAuthenticated, async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        // Retrieve the booking details from the database
        const booking = await Client.findById(bookingId);
        // Render the edit form with the booking details
        res.render('admin/editBookingPage', { booking, ADMIN_SECRET_KEY});
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

// Route to update a booking
router.post('/edit/:id', isAdminAuthenticated, async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        // Update the booking details in the database
        await Client.findByIdAndUpdate(bookingId, req.body);
        // Redirect back to the admin page after updating
        res.redirect(`/admin/?key=${ADMIN_SECRET_KEY}`);
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

module.exports = router;
