const express = require("express");
const cookiesession = require("cookie-session");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString} = require("./helpers");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(cookiesession({
  name: "session",
  keys: ["INoFeelSoGood"]
}));

const urlDatabase = {
  "b2xVn2":  {
    longURL: "https://www.lighthouselabs.ca",
    userID:"aJ48lW"
  },
  "9sm5xK": {
    longURL: "https://www.google.com",
    userID:"aJ48lW"
  }
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "user3@example.com",
    password: "kerfuffle-35"
  },

};


/* <--------------------- Updated and hashed passwords for users in database ---------------------> */

users["userRandomID"].password = bcrypt.hashSync("1234",10);
users["user2RandomID"].password = bcrypt.hashSync("dishwasher-funk",10);
users["aJ48lW"].password = bcrypt.hashSync("kerfuffle-35",10);


/* <---------------------------------------  Get Routes  -----------------------------------------> */


app.get("/", (require, response) => {
  const userID = require.session.user_id;
  if (userID) {
    return response.redirect("/urls");
  }
  return response.redirect("/login");
});

// Sends the user to an existing longURL through a shortURL link
app.get("/u/:shortURL", (require, response) => {
  const urlObject = urlDatabase[require.params.shortURL];
  const longURL = urlObject ? urlObject.longURL : null;
  if (!longURL) {
    return response.status(404).send("URL cannot be found");
  }
  response.redirect(longURL);
});

app.get("/urls.json", (require, response) => {
  response.json(urlDatabase);
});

// Users can see both existing longURL's and shortURL's
app.get("/urls", (require, response) => {
  const userID = require.session.user_id;
  if (!userID) {
    return response.status(401).send("Please <a href='/login'>login</a> first to continue");
  }
  const shortURL = urlsForUser(userID, urlDatabase);

  const templateVars = {
    urls: shortURL,
    user_id: userID,
    users
  };
  response.render("urls_index", templateVars);
});

// Redirects a logged in client to a new page to create a new URL
app.get("/urls/new", (require, response) => {
  const userID = require.session.user_id;
  const templateVars = {
    email: getUserByEmail(userID),
    user_id: userID,
    users
  };
  if (!userID) {
    return response.redirect("/login");
  }
  response.render("urls_new", templateVars);
});

// Enables authorized users to see shortURL's using provided longURL's
app.get("/urls/:shortURL", (require, response) => {
  const registeredUser = require.session.user_id;
  const shortURL = require.params.shortURL;
  const urlAddress = urlDatabase[shortURL];

  if (!urlAddress) {
    return response.send("Address entered is not valid");
  }

  if (urlAddress.userID !== registeredUser) {
    return response.send("This web address is already taken");
  }

  if (urlAddress.userID === registeredUser) {
    const templateVars = {
      shortURL,
      longURL: urlAddress.longURL,
      user_id: registeredUser,
      users
    };
    response.render("urls_show", templateVars);
  }
});

// Enables users to see the registration page and create a new account
app.get("/register", (require, response) => {
  const userID = require.session.user_id;
  if (userID) {
    return response.redirect("/urls");
  }
  const templateVars = {
    user_id: userID,
    users
  };
  response.render("urls_register", templateVars);
});

// Enables users to view the login page and sign in an existing account
app.get('/login', (require, response) => {
  const userID = require.session.user_id;
  if (userID) {
    response.redirect("/urls");

  }
  const templateVars = {
    user_id: userID,
    users
  };
  response.render("urls_login", templateVars);
});

/* <--------------------------------------  Post Routes  ------------------------------------------> */

// Logged in users can create a short URL and redirects them to the new shortURl page
app.post("/urls", (require, response) => {
  const userID = require.session.user_id;
  const longURL = require.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL,
    userID: userID
  };
  response.redirect(`/urls/${shortURL}`);
});

// Enables users to delete created shortURL's
app.post('/urls/:shortURL/delete', (require, response) => {
  const userID = require.session.user_id;
  if (!userID) {
    return response.status(401).send("Please <a href='/login'>login</a> first to continue");
  }
  const shortURL = require.params.shortURL;
  const userURLs = urlsForUser(userID, urlDatabase);
  if (shortURL in userURLs) {
    delete urlDatabase[shortURL];
    response.redirect("/urls");
  } else {
    return response.status(401).send("Unable to access, user is not authorized");
  }
});

// Enables users to create a shortURL using longURL
app.post('/urls/:shortURL', (require, response) => {
  const userID = require.session.user_id;
  if (!userID) {
    return response.status(401).send("Please <a href='/login'>login</a> first to continue");
  }
  const longURL = require.body.longURL;
  const shortURL = require.params.shortURL;
  const userURLs = urlsForUser(userID, urlDatabase);

  if (shortURL in userURLs) {
    urlDatabase[shortURL] = {
      longURL,
      userID: userID
    };
    response.redirect("/urls");
  }
});

// Enables existing logged in users to send post requests if their email and passwords match the records in the database
app.post("/login", (require, response) => {
  const userEmail = require.body.email;
  const userPass = require.body.password;

  if (!userEmail) {
    return response.status(403).send("The email entered is invalid");
  } else if (getUserByEmail(userEmail, users)) {
    const userID = getUserByEmail(userEmail, users);
    const user = users[userID];

    if (!bcrypt.compareSync(userPass, user.password)) {
      return response.status(403).send("The password entered is invalid");
    } else {
      require.session.user_id = userID;
      response.redirect("/urls");
    }
  } else {
    return response.status(400).send("Invalid email");
  }
});

// Enables the user to log out and clears cookies
app.post("/logout", (require, response) => {
  require.session = null;
  response.redirect("/urls");
});

// Enables the user to register as long as they enter a valid email address
app.post("/register", (require, response) => {
  const userEmail = require.body.email;
  const userPass = require.body.password;
  const hashPass = bcrypt.hashSync(userPass,10);

  if (!userEmail || !userPass) {
    response.status(400).send("Invalid username/password");
  } else if (getUserByEmail(userEmail, users)) {
    response.status(403).send("This email address is already being used");
  } else {
    const user = {
      id: generateRandomString(6),
      email: require.body.email,
      password: hashPass
    };
    users[user.id] = user;
    require.session.user_id = user.id;
    response.redirect("/urls");
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});