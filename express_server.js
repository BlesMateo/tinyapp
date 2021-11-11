const express = require("express");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
//const userid length = 6;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString(length) {
  const numsandLetters = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  randomString = "";
  for (let a = 0; a < length; a =  a + 1) {
    randomString += numsandLetters.charAt(Math.floor(Math.random() * numsandLetters.length))
  }
  return randomString;
}
//console.log(generateRandomString(6));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
  urls: urlDatabase,
  user: req.cookies["user"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: req.cookies["user"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
  shortURL: req.params.shortURL,
  longURL: urlDatabase[req.params.shortURL],
  user: req.cookies["user"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls");
});

app.post('/urls/:shortURL', (req, res)=> {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  res.cookie("user", req.body.user);
  res.redirect("/urls");
  })

app.post("/logout", (req, res) => {
  res.clearCookie('user', req.body.user);
  res.redirect("/urls");
  });

app.get("/register", (req, res) => {
  const templateVars = {user: req.cookies["user"]};
  res.render("urls_register", templateVars)
});

app.post("/register", (req, res) => {
  const user = {
  id: generateRandomString(6),
  email: req.body.email,
  password: req.body.password
  };
  if (user["email"] === "" || user["password" === ""]) {
    res.status(400).send("Invalid username/password");
  }

  users[user.id] = user
  res.cookie["user", user];
  res.redirect("/urls")
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});