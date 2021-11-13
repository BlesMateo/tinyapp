const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      //console.log("user", user)
      return user;
    }
  }
  return undefined;
}

const urlsForUser = (id, urlDatabase) => {
  const userURLs = {};
  if(!id) {
    return null;
  }

  for(const key in urlDatabase){
    if(urlDatabase[key].userID === id) {
      userURLs[key] = urlDatabase[key]
    }
  }
  return userURLs;
}

const generateRandomString = (length) => {
  const numsandLetters = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  randomString = "";
  for (let a = 0; a < length; a =  a + 1) {
    randomString += numsandLetters.charAt(Math.floor(Math.random() * numsandLetters.length))
  }
  return randomString;
}

module.exports = { getUserByEmail, urlsForUser, generateRandomString };