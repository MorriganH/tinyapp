const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = () => {
  const characters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  let shortID = '';
  for (let char = 0; char < 6; char++) {
    shortID += characters[Math.floor(Math.random() * 62)];
  }
  return shortID;
};

const findUser = (email, userDB) => {
  for (let userID in userDB) {
    if (userDB[userID].email === email) {
      return userDB[userID];
    }
  }
  return null;
};

const urlsForUser = (id) => {
  let usersURLS = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      usersURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return usersURLS;
};

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
    password: '567Potato',
  },
  '3sVa8L': {
    id: '3sVa8L',
    email: 'silly@test.com',
    password: 'hahaha',
  },
};

app.get('/', (req, res) => {

  res.redirect('/urls');
});

app.get('/urls', (req, res) => {

  let loggedIn = false;
  if (req.cookies['user_ID']) {
    loggedIn = true;
  }

  const templateVars = {
    urls: urlsForUser(req.cookies['user_ID']),
    user: userDB[req.cookies["user_ID"]] || {},
    loggedIn
  };

  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {

  if (!req.cookies['user_ID']) {
    res.status(400).send("You have to be logged in to shorten a URL!");
    return;
  }
  
  const shortID = generateRandomString();
  urlDatabase[shortID].longURL = req.body.longURL;

  res.redirect(`/urls/${shortID}`);
});

app.get('/urls/new', (req, res) => {

  if (!req.cookies['user_ID']) {
    res.redirect('/login');
    return;
  }
  
  const templateVars = { user: userDB[req.cookies["user_ID"]] || {} };

  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {

  let loggedIn = false;
  if (req.cookies['user_ID']) {
    loggedIn = true;
  }

  const templateVars = {
    id: req.params.id,
    dataURL: urlDatabase[req.params.id],
    user: userDB[req.cookies["user_ID"]] || {},
    loggedIn
  };

  res.render('urls_show', templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  
  const id = req.params.id;

  if (!(id in urlDatabase)) {
    res.status(400).send("URL does not exist");
    return;
  }
  
  if (!req.cookies['user_ID']) {
    res.status(400).send("You must be logged in to perform this action");
    return;
  }

  if (req.cookies["user_ID"] !== urlDatabase[id].userID) {
    res.status(400).send("You did not create this URL");
    return;
  } 
  
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {

  const id = req.params.id;
  
  if (!(id in urlDatabase)) {
    res.status(400).send("URL does not exist");
    return;
  }

  if (!req.cookies['user_ID']) {
    res.status(400).send("You must be logged in to perform this action");
    return;
  }
  
  if (req.cookies["user_ID"] !== urlDatabase[id].userID) {
    res.status(400).send("You did not create this URL");
    return;
  } 

  urlDatabase[id].longURL = req.body.longURL;
  
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {

  if (!urlDatabase[req.params.id].longURL) {
    res.status(400).send("URL '" + req.params.id + "' does not exist");
    return;
  }

  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});

app.get('/register', (req, res) => {

  if (req.cookies['user_ID']) {
    res.redirect('/urls');
    return;
  }

  const templateVars = { user: {} }

  res.render('register', templateVars);
})

app.post('/register', (req, res) => {

  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).send("Please fill all fields");
    return;
  }

  const user = findUser(email, userDB);

  if (user) {
    res.status(400).send("User already exists");
    return;
  }

  const userID = generateRandomString();
  userDB[userID] = {
    id: userID,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  console.log(password);
  console.log(userDB[userID].password);

  res.cookie('user_ID', userID);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {

  if (req.cookies['user_ID']) {
    res.redirect('/urls');
    return;
  }
  
  const templateVars = {user: {}};

  res.render('login', templateVars)
});

app.post('/login', (req, res) => {

  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).send("Please fill all fields");
    return;
  }
  
  const user = findUser(email, userDB);
  
  if (!user) {
    res.status(403).send("User email not found");
    return;
  }

  // if (user.password !== password) {
  if (!(bcrypt.compareSync(password, user.password))) {
    res.status(403).send("Password does not match");
    return;
  }
  console.log(password);

  res.cookie('user_ID', user.id);
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {

  res.clearCookie('user_ID');
  res.redirect('/login');
});

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});