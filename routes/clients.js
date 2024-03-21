// routes/users.js
const express = require('express');
const router = express.Router();
const Laser = require('../models/laser');
const Client = require("../models/client")
// Define routes
router.get('/', async (req, res, next) => {
    try {
        const lasers = await Laser.find();
        return res.render('homePage', { lasers }); // Pass laser data to the Pug template
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});


router.get('/book/:id', async (req, res, next) => {
    try {
        const laser = await Laser.findById(req.params.id);
        if (!laser) {
            return res.status(404).send("Laser service not found");
        }
        // Render the booking page with the laser information
        return res.render('bookingPage', { laser });
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});



// POST route to process booking form data
router.post('/book/:id', async (req, res, next) => {
    try {
        const laser = await Laser.findById(req.params.id);
        if (!laser) {
            return res.status(404).send("Laser service not found");
        }

        // Create a new instance of the Client model with form data
        const newClient = new Client({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            appointmentDate: req.body.appointmentDate,
            laserName: laser.laserName,
            laserPrice: laser.laserPrice,
            laserTime: laser.laserTime
        });

        // Save the new client data to the database
        await newClient.save();

        // Redirect to a success page after booking
        return res.redirect('/success');
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

module.exports = router;
