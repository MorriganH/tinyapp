// module used to store the databases

// requiring bcryptjs in this file is just to hash the passwords of the existing (test) users, would not be necessary otherwise
const bcrypt = require('bcryptjs');

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'jD0v9w',
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'jD0v9w',
  },
};

const userDB = {
  'jD0v9w': {
    id: 'jD0v9w',
    email: 'morrigan@test.com',
    password: bcrypt.hashSync('567Potato', 10)
  },
  '3sVa8L': {
    id: '3sVa8L',
    email: 'silly@test.com',
    password: bcrypt.hashSync('hahaha', 10)
  },
};

module.exports = { urlDatabase, userDB };