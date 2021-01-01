let nodemailer = require('nodemailer');

const mailer = (to, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'venuetrackerbyobaranek@gmail.com',
      pass: 'venuetracker1234'
    }
  });

  let mailOptions = {
    from: 'venuetrackerbyobaranek@gmail.com',
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = mailer;
