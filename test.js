const bcrypt = require('bcrypt');

const password = 'admin123'; // Replace with your actual password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});
