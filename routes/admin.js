const express = require('express');
const router = express.Router();
const Client = require('../models/client');
const dotenv = require('dotenv'); // Import dotenv
const Laser = require('../models/laser');
const { check, validationResult } = require('express-validator');

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

// Route to get all lasers
router.get('/laser', isAdminAuthenticated, async (req, res, next) => {
    try {
        // Retrieve all lasers from the database
        const lasers = await Laser.find();
        // Render the admin page with the laser list
        return res.render('admin/laserListPage', { lasers ,ADMIN_SECRET_KEY });
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

// GET method to render the add laser page
router.get('/laser/add/', isAdminAuthenticated, async (req, res, next) => {
    try {
        res.render('admin/addLaserPage', { ADMIN_SECRET_KEY });
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

// POST method to add a new laser
router.post('/laser/add/', isAdminAuthenticated, [
    check('laserName').notEmpty().withMessage('Laser name is required'),
    check('laserPrice').isNumeric().withMessage('Laser price must be a number'),
    check('laserTime').notEmpty().withMessage('Laser time is required')
], async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('admin/addLaserPage', { 
                errors: errors.array(),
                ADMIN_SECRET_KEY
            });
        }

        // Create a new instance of the Laser model with form data
        const newLaser = new Laser({
            laserName: req.body.laserName,
            laserPrice: req.body.laserPrice,
            laserTime: req.body.laserTime
        });

        // Save the new laser data to the database
        await newLaser.save();

        // Redirect to some page (e.g., laser list) or send a success response
        res.redirect(`/admin/laser?key=${ADMIN_SECRET_KEY}`);  // Adjust the redirection as necessary
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});


// GET method to render the edit laser page
router.get('/edit-laser/edit/:id', isAdminAuthenticated, async (req, res, next) => {
    try {
        const laserId = req.params.id;
        const laser = await Laser.findById(laserId);
        res.render('admin/editLaserPage', { laser, ADMIN_SECRET_KEY });
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

// POST method to update a laser
router.post('/edit-laser/edit/:id', isAdminAuthenticated, [
    check('laserName').notEmpty().withMessage('Laser name is required'),
    check('laserPrice').isNumeric().withMessage('Laser price must be a number'),
    check('laserTime').notEmpty().withMessage('Laser time is required')
], async (req, res, next) => {
    try {
        const laserId = req.params.id;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const laser = await Laser.findById(laserId);
            return res.status(400).render('admin/editLaserPage', {
                errors: errors.array(),
                laser,
                ADMIN_SECRET_KEY
            });
        }

        await Laser.findByIdAndUpdate(laserId, {
            laserName: req.body.laserName,
            laserPrice: req.body.laserPrice,
            laserTime: req.body.laserTime
        });

        res.redirect(`/admin/laser?key=${ADMIN_SECRET_KEY}`);
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

// Route to delete a laser
router.post('/edit-laser/delete/:id', isAdminAuthenticated, async (req, res, next) => {
    try {
        const laserId = req.params.id;
        await Laser.findByIdAndDelete(laserId);
        res.redirect(`/admin/laser?key=${ADMIN_SECRET_KEY}`);
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

module.exports = router;
