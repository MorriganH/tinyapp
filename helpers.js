// generates random 6 character strings for user ids and shortURLs
const generateRandomString = () => {
  const characters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  let shortID = '';
  for (let char = 0; char < 6; char++) {
    shortID += characters[Math.floor(Math.random() * 62)];
  }
  return shortID;
};

// checks if a given user is registered in the database
const findUser = (email, userDB) => {
  for (let userID in userDB) {
    if (userDB[userID].email === email) {
      return userDB[userID];
    }
  }
  return null;
};

// returns an object containing a subset of the urlDatabase that belong to the given user id
const urlsForUser = (id, urlDatabase) => {
  let usersURLS = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      usersURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return usersURLS;
};

module.exports = { generateRandomString, findUser, urlsForUser };