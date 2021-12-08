const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//*********************** USE **************************//
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
//******************** function *****************************//
//Generate a Random ShortURL
const generateRandomString = function() {
	const shortURL = Math.random().toString(36).substring(2, 8);
	return shortURL;
};
const addNewUser = (email, password) => {
	const userId = Math.random().toString(36).substring(2, 8);
	const newUser = {
		id: userId,
		email,
		password
	};
	users[userId] = newUser;
	return userId;
};
const findUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
	return false;
};
const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user.id;
  }
  return false;
};

//************************** Database ***********************//
//url database
const urlDatabase = {
	b2xVn2: 'http://www.lighthouselabs.ca',
	'9sm5xK': 'http://www.google.com'
};
//user database
const users = {
	eb849b1f: {
		id: 'eb849b1f',
		// name: 'Kent Cook',
		email: 'really.kent.cook@kitchen.com',
		password: 'cookinglessons'
	},
	'1dc937ec': {
		id: '1dc937ec',
		// name: 'Phil A. Mignon',
		email: 'good.philamignon@steak.com',
		password: 'meatlover'
	}
};

//********************** Get ***************************//

app.get('/', (req, res) => {
	res.send('Hello!');
});
app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
	const templateVars = { greeting: 'Hello World!' };
	res.render('hello_world', templateVars);
});
app.get('/urls', (req, res) => {
	const templateVars = {
		urls: urlDatabase,
		user: req.cookies['user_id']
	};
	res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
	const templateVars = {
		user: req.cookies['user_id']
	};
	res.render('urls_new', templateVars);
});
app.get('/urls/:shortURL', (req, res) => {
	const templateVars = {
		shortURL: req.params.shortURL,
		longURL: urlDatabase[req.params.shortURL],
		user: req.cookies['user_id']
	};
	res.render('urls_show', templateVars);
});
app.get('/u/:shortURL', (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL];
	res.redirect(longURL);
});
//********************* Post ****************************//

app.post('/urls', (req, res) => {
	const shortURL = generateRandomString();
	const longURL = req.body.longURL;
	urlDatabase[shortURL] = longURL;
	res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id', (req, res) => {
	const shortURL = req.params.id;
	urlDatabase[shortURL] = req.body.longURL;
	res.redirect('/urls');
});

//********************* Login ****************************//

app.get('/login', (req,res)=>{
	console.log("Login");
	const templateVars = { user: null };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const userId = authenticateUser(email, password);
	if (userId){
		res.cookie('user_id', userId);
		res.redirect('/urls');
	} else {
		res.status(401).send('Wrong credentials! Please check your email or password');
	}
});
//********************* Register ****************************//
app.get('/register', (req, res) => {
	const templateVars = { user: null };
	res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
	// const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const user = findUserByEmail(email);
	if(!user){
		const userId = addNewUser(email, password);
		res.cookie('user_id', userId);
		res.redirect('/urls');
	} else {
		res.status(403).send('User is already registered!');
	}
});
//check users in json
app.get('/users.json', (req, res) => {
	res.json(users);
});

//Logout
app.post('/logout', (req, res) => {
	res.clearCookie('user_id');
	res.redirect('/urls');
});
//Delete
app.post('/urls/:shortURL/delete', (req, res) => {
	const shortURL = req.params.shortURL;
	delete urlDatabase[shortURL];
	res.redirect(`/urls`);
});
//********************** Listen ***************************//
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
