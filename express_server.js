const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

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

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const userDB = {
  'jD0v9w': {
    id: 'jD0v9w',
    email: 'morrigan@test.com',
    password: '567Potato',
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user: userDB[req.cookies["user_ID"]] || {} };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortID = generateRandomString();
  urlDatabase[shortID] = req.body.longURL;
  res.redirect(`/urls/${shortID}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: userDB[req.cookies["user_ID"]] || {} };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: userDB[req.cookies["user_ID"]] || {} };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  if (req.cookies['user_ID']) {
    res.redirect('/urls');
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
    password
  };

  res.cookie('user_ID', userID);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  if (req.cookies['user_ID']) {
    res.redirect('/urls');
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

  if (user.password !== password) {
    res.status(403).send("Password does not match");
    return;
  }

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