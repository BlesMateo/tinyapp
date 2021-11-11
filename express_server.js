const express = require("express");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const morgan = require("morgan")
const app = express();
const PORT = 8080; // default port 8080
//const userid length = 6;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan("dev"))


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
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

const getUserByEmail= (email) => {
  for(let user in users) {
    if(users[user].email === email){
      return users[user].id;
    }
  }
  return null;
}


const generateRandomString = (length) => {
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
  user_id: req.cookies["user_id"],
  users
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    email: getUserByEmail(req.cookies["user_id"]),
    user_id: req.cookies["user_id"],
    users
  };
  if(!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
  shortURL: req.params.shortURL,
  longURL: urlDatabase[req.params.shortURL].longURL,
  user_id: req.cookies["user_id"],
  users
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL,
    user_id: req.cookies["user_id"]
  };
  console.log("urlDatabase:", urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const urlObject = urlDatabase[req.params.shortURL]
  const longURL = urlObject ? urlObject.longURL : null //if object exists return longURL else return null
  console.log(longURL)
  if(!longURL){
    return res.status(404).send("URL cannot be found")
  }
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL,
    user_id: req.cookies["user_id"]
  };
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    users
  }
  res.render("urls_login", templateVars)
});


app.post("/login", (req, res) => {
    const inputEmail = req.body.email;
    const inputPass = req.body.password; // retrieve password from database object users (users[user].password)

      if (!inputEmail || !inputPass) {
        return res.status(403).send(" The email entered is not valid");
      } else if (getUserByEmail(inputEmail, users)) {
        const user = getUserByMail(inputEmail, users);
        if(inputPassword !== users[user].password) {
          return res.status(403).send("The password entered is not valid");
        } else {
          res.cookie["user", user];
          res.redirect("/urls")
        }
        } else {
        return res.status(400).send("The email provided cannot be found, please enter a valid email")
      }
    });

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.cookies["user_id"]);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    users
  }
  res.render("urls_register", templateVars)
});

app.post("/register", (req, res) => {
const userEmail = req.body.email;
const userPass = req.body.password;

  if (!userEmail || !userPass) {
    res.status(400).send("Invalid username/password");
  } else if (getUserByEmail(userEmail)){
    res.sendStatus(400).send("This email address is already being used")
  } else {
  const user = {
    id: generateRandomString(6),
    email: req.body.email,
    password: req.body.password
  };
  users[user.id] = user
  res.cookie["user", user];
  res.redirect("/urls")
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});