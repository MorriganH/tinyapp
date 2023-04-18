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

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.get('/', (req, res) => {
//   res.send("Hello!");
// });

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies['username'] };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.post('/urls', (req, res) => {
  const shortID = generateRandomString();
  urlDatabase[shortID] = req.body.longURL;
  res.redirect(`/urls/${shortID}`);
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

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});