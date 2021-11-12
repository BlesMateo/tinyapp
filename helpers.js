const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      //console.log("user", user)
      return user;
    }
  }
  return undefined;
}

const urlsForUser = (id) => {
  const userURLs = {};
  if(!id) {
    return null;
  }

  for(const key in urlDatabase){
    if(urlDatabase[key].userID === id) {
      userURLs[key] = urlDatabase[key]
    }
  }
  return userURLs
}
module.exports = { getUserByEmail, urlsForUser};