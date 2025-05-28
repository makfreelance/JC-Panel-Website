// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 61002,
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
  } else {
    console.log('Connected to MySQL DB');
  }
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your app password
  },
});

// Booking API
app.post('/bookings', (req, res) => {
  const {
    full_name,
    email,
    phone,
    vehicle_make_model,
    license_plate,
    service_needed,
    preferred_date,
    message,
  } = req.body;

  if (!full_name || !email || !phone || !vehicle_make_model || !service_needed || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const sql = `
    INSERT INTO bookings 
    (full_name, email, phone, vehicle_make_model, license_plate, service_needed, preferred_date, message) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  //SQL QUERY

  db.query(sql, [full_name, email, phone, vehicle_make_model, license_plate, service_needed, preferred_date, message], (err, result) => {
    if (err) {
      console.error('Database insert error:', err);
      return res.status(500).json({ error: 'Database error. Please try again later.' });
    }

    // Prepare email content
    const emailContent = `
      Thank you, ${full_name}, for your booking at JC Panel Beaters.

      Here are your booking details:
      - Name: ${full_name}
      - Email: ${email}
      - Phone: ${phone}
      - Vehicle: ${vehicle_make_model}
      - License Plate: ${license_plate}
      - Service Needed: ${service_needed}
      - Preferred Date: ${preferred_date}
      - Message: ${message}

      We'll be in touch shortly to confirm your appointment.
    `;

    // Send email to user
    transporter.sendMail({
      from: 'JC Panel Beaters',
      to: email,
      subject: 'JC Panel Beaters - Booking Confirmation',
      text: emailContent,
    }, (error, info) => {
      if (error) {
        console.error('Email error (user):', error);
      } else {
        console.log('Email sent to user:', info.response);
      }
    });

    // Send email to admin
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // stored in .env
      subject: 'New Booking Received - JC Panel Beaters',
      text: `New booking received:\n\n${emailContent}`,
    }, (error, info) => {
      if (error) {
        console.error('Email error (admin):', error);
      } else {
        console.log('Email sent to admin:', info.response);
      }
    });

    res.json({ message: 'Booking successful.' });
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
