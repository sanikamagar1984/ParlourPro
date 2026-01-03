const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER, // your gmail
    pass: process.env.EMAIL_PASS  // gmail app password
  }
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error('❌ Gmail SMTP Error:', error);
  } else {
    console.log('✅ Gmail SMTP ready - real emails will be sent');
  }
});

module.exports = transporter;
