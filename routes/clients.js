const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Laser = require('../models/laser');
const Client = require("../models/client");
const nodemailer = require('nodemailer'); // Import nodemailer

// Define validation rules for booking form data
const validateBookingForm = [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('appointmentDate').notEmpty().withMessage('Appointment date is required')
];

// Define routes
router.get('/', async (req, res, next) => {
    try {
        const lasers = await Laser.find();
        return res.render('homePage', { lasers });
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
router.post('/book/:id', validateBookingForm, async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('bookingPage', { 
                errors: errors.array(),
                laser: await Laser.findById(req.params.id)
            });
        }

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

        // Send email with booked data to your email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: process.env.EMAIL_USERNAME, 
            subject: 'New Booking',
            text: `A new booking has been made with the following details:\n\nName: ${req.body.firstName} ${req.body.lastName}\nPhone Number: ${req.body.phoneNumber}\nEmail: ${req.body.email}\nAppointment Date: ${req.body.appointmentDate}\n\nService Details:\nService: ${laser.laserName}\nDuration: ${laser.laserTime} Minutes\nPrice: CA$ ${laser.laserPrice}\n`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.error(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        // Redirect to a success page after booking
        return res.redirect('/client/success');
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

router.get('/success',  async (req, res, next) => {
return res.render('success')

});

module.exports = router;
