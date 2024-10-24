const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Laser = require('../models/laser');
const Client = require("../models/client");
const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure environment variables are loaded

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
        const currentPath = req.path;

        const lasers = await Laser.find();
        return res.render('homePage', {currentPath, lasers, currentPage: 'book-appointment' });
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

router.get('/book/:id', async (req, res, next) => {
    try {
        const currentPath = req.path;
console.log(currentPath);
        const lasers = await Laser.find();
        const laser = await Laser.findById(req.params.id);
        if (!laser) {
            return res.status(404).send("Laser service not found");
        }
        // Render the booking page with the laser information
        return res.render('bookingPage', { currentPath, laser, lasers, currentPage: 'booking Page' });
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

        // Find the selected laser service
        const laser = await Laser.findById(req.params.id);
        if (!laser) {
            return res.status(404).send("Laser service not found");
        }

        // Get additional services from the request
        const additionalServiceIds = req.body.additionalServices || [];
        console.log('Additional Services:', additionalServiceIds); // This should log an array of selected service IDs

        // Fetch additional services details from Laser model using the IDs
        const additionalServices = await Laser.find({ _id: { $in: additionalServiceIds } });

        // Create a new instance of the Client model with form data
        const newClient = new Client({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            appointmentDate: req.body.appointmentDate,
            laserName: laser.laserName,
            laserPrice: laser.laserPrice,
            laserTime: laser.laserTime,
            additionalServices: additionalServiceIds // Save selected additional service IDs
        });

        // Save the new client data to the database
        await newClient.save().catch(error => {
            console.error('Error saving client:', error);
        });

        // Send email with booking details
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Prepare additional services text
        let additionalServicesText = '';
        if (additionalServices.length > 0) {
            additionalServicesText = additionalServices.map(service => 
                `${service.laserName} - ${service.laserTime} Minutes @ CA$ ${service.laserPrice}`
            ).join('\n');
        } else {
            additionalServicesText = 'None';
        }

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: process.env.EMAIL_USERNAME,
            subject: 'New Booking',
            text: `A new booking has been made with the following details:\n\n` +
                  `Name: ${req.body.firstName} ${req.body.lastName}\n` +
                  `Phone Number: ${req.body.phoneNumber}\n` +
                  `Email: ${req.body.email}\n` +
                  `Appointment Date: ${req.body.appointmentDate}\n\n` +
                  `Service Details:\nService: ${laser.laserName}\n` +
                  `Duration: ${laser.laserTime} Minutes\n` +
                  `Price: CA$ ${laser.laserPrice}\n\n` +
                  `Additional Services:\n${additionalServicesText}`
        };

        const sendMailWithRetry = (mailOptions, retries = 3) => {
            return new Promise((resolve, reject) => {
                const attemptToSend = (attempt) => {
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            if (attempt <= retries) {
                                console.error(`Attempt ${attempt} failed: ${error.message}. Retrying...`);
                                setTimeout(() => attemptToSend(attempt + 1), 2000);
                            } else {
                                reject(error);
                            }
                        } else {
                            resolve(info);
                        }
                    });
                };
                attemptToSend(1);
            });
        };

        // Try to send the email
        try {
            const info = await sendMailWithRetry(mailOptions);
            console.log('Email sent: ' + info.response);
        } catch (error) {
            console.error('Failed to send email after retries: ', error);
        }

        // Redirect to a success page after booking
        return res.redirect('/client/success');
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

router.get('/success', (req, res) => {
    return res.render('success');
});

module.exports = router;
