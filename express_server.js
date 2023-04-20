const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const PORT = 8080;

const { generateRandomString, findUser, urlsForUser } = require('./helpers');
const { urlDatabase, userDB } = require('./databases');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['123', '456', '789']
}));

// homepage, redirects to /urls if logged in, or /login if not
app.get('/', (req, res) => {

  if (req.session.user_ID) {
    res.redirect('/urls');
    return;
  }

  res.redirect('/login');
});

// page to show list of user's URLs. renders with urls_index.ejs
app.get('/urls', (req, res) => {

  let loggedIn = false;
  if (req.session.user_ID) {
    loggedIn = true;
  }

  const templateVars = {
    urls: urlsForUser(req.session.user_ID, urlDatabase),
    user: userDB[req.session.user_ID] || {},
    loggedIn
  };

  res.render('urls_index', templateVars);
});

// generates new shortURL for the current user. post request to this page can be found in urls_new.ejs
app.post('/urls', (req, res) => {

  if (!req.session.user_ID) {
    res.status(400).send("You have to be logged in to shorten a URL!");
    return;
  }
  
  const shortID = generateRandomString();
  urlDatabase[shortID] = {
    longURL: req.body.longURL,
    userID: req.session.user_ID
  };

  res.redirect(`/urls/${shortID}`);
});

// page to generate new shortURL. renders with urls_new.ejs
app.get('/urls/new', (req, res) => {
  
  if (!req.session.user_ID) {
    res.redirect('/login');
    return;
  }
  
  const templateVars = { user: userDB[req.session.user_ID] || {} };
  
  res.render('urls_new', templateVars);
});

// page to view details about one shortURL. renders with urls_show.ejs
app.get('/urls/:id', (req, res) => {

  let loggedIn = false;
  if (req.session.user_ID) {
    loggedIn = true;
  }
  
  const templateVars = {
    id: req.params.id,
    dataURL: urlDatabase[req.params.id],
    user: userDB[req.session.user_ID] || {},
    loggedIn
  };
  
  res.render('urls_show', templateVars);
});

// edits the longURL associated with :id. post request to this page can be found in urls_show.ejs
app.post('/urls/:id', (req, res) => {

  const id = req.params.id;
  
  if (!(id in urlDatabase)) {
    res.status(400).send("URL does not exist");
    return;
  }

  if (!req.session.user_ID) {
    res.status(400).send("You must be logged in to perform this action");
    return;
  }
  
  if (req.session.user_ID !== urlDatabase[id].userID) {
    res.status(400).send("You did not create this URL");
    return;
  }

  urlDatabase[id].longURL = req.body.longURL;
  
  // the 'Updating URLs' assignment page says this should redirect to the urls_show (urls/:id) page, but the submit project page says this should redirect to the /urls page. I feel like going back to the id page makes a bit more sense, so I went with that
  res.redirect(`/urls/${id}`);
});

// deletes the data at the :id. post request to this page can be found in urls_index.ejs
app.post('/urls/:id/delete', (req, res) => {
  
  const id = req.params.id;

  if (!(id in urlDatabase)) {
    res.status(400).send("URL does not exist");
    return;
  }
  
  if (!req.session.user_ID) {
    res.status(400).send("You must be logged in to perform this action");
    return;
  }

  if (req.session.user_ID !== urlDatabase[id].userID) {
    res.status(400).send("You did not create this URL");
    return;
  }
  
  delete urlDatabase[id];
  res.redirect('/urls');
});

// redirects to the longURL webpage associated with :id
app.get('/u/:id', (req, res) => {

  if (!urlDatabase[req.params.id]) {
    res.status(400).send("URL '" + req.params.id + "' does not exist");
    return;
  }

  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});

// page to register a new user. renders with register.ejs
app.get('/register', (req, res) => {

  if (req.session.user_ID) {
    res.redirect('/urls');
    return;
  }

  const templateVars = { user: {} };

  res.render('register', templateVars);
});

// generates new user information. post request to this page can be found in register.ejs
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

  bcrypt.hash(password, 10, (err, hash) => {
    const userID = generateRandomString();
    userDB[userID] = {
      id: userID,
      email,
      password: hash
    };

    req.session.user_ID = userID;
    res.redirect('/urls');
  });
});

// page to login to an existing user. renders with login.ejs
app.get('/login', (req, res) => {

  if (req.session.user_ID) {
    res.redirect('/urls');
    return;
  }
  
  const templateVars = {user: {}};

  res.render('login', templateVars);
});

// sets cookie session so a user can be logged in. post request to this page can be found in login.ejs
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

  bcrypt.compare(password, user.password)
    .then((result) => {
      if (result) {
        req.session.user_ID = user.id;
        res.redirect('/urls');
      } else {
        throw Error;
      }
    })
    .catch(() => {
      res.status(403).send("Password does not match");
    });
});

// clears cookie session to logout the user
app.post('/logout', (req, res) => {

  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});