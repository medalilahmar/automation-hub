const { exec } = require('child_process');

const EMAIL_HOST = 'smtp.example.com';
const EMAIL_USER = 'user';
const EMAIL_PASS = 'password';

const sendEmail = (to, subject, body) => {
  const command = `echo "${body}" | mail -s "${subject}" ${to}`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Erreur envoi email:', error);
    } else {
      console.log('Email envoyé:', stdout);
    }
  });
};

module.exports = { sendEmail };