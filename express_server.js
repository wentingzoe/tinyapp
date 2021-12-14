//Requiring external function, packages and module
const { generateRandomString, addNewUser, findUserByEmail, urlsForUser, dateVisitInfoForUser } = require('./helpers');
const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');

//*********************** USE **************************//
// user cookie parser
app.use(
	cookieSession({
		name: 'session',
		keys: [ 'key1', 'key2' ],
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	})
);

// use body parser
app.use(bodyParser.urlencoded({ extended: true }));

// override with POST having ?_method=DELETE or ?_method=PUT
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});

//************************** Database ***********************//

//url database
const urlDatabase = {
	b6UTxQ: {
		longURL: 'https://www.tsn.ca',
		userId: 'aJ48lW',
		created: new Date(),
	},
	i3BoGr: {
		longURL: 'https://www.google.ca',
		userId: 'aJ48lW',
		created: new Date(),
	}
};

//user database
const users = {
	aJ48lW: {
		id: 'aJ48lW',
		email: 'really.kent.cook@kitchen.com',
		password: bcrypt.hashSync('1234', 10)
	},
	'1dc937ec': {
		id: '1dc937ec',
		email: 'good.philamignon@steak.com',
		password: bcrypt.hashSync('meatlover', 10)
	}
};

//********************** Get ***************************//
// homepage
app.get('/', (req, res) => {
	const userId = req.session.userId;
	if (userId) {
		res.redirect('/urls');
	} else {
		res.redirect('/login');
	}
});

// urls page
app.get('/urls', (req, res) => {
	const userId = req.session.userId;
	const userUrls = urlsForUser(userId, urlDatabase);
	const stretchInfo = dateVisitInfoForUser(userUrls, urlDatabase);
	if (!userId) {
		return res.status(401).send("Please <a href='/login'> login</a> first");
	} else {
		const templateVars = {
			user: users[userId],
			urls: userUrls,
			stretchInfo
		};
		res.render('urls_index', templateVars);
	}
});
// Login page
app.get('/login', (req, res) => {
	let userId = req.session.userId;
	if (userId) {
		res.redirect('/');
	} else {
		let templateVars = {
			user: users[userId]
		};
		res.render('urls_login', templateVars);
	}
});

// Register Page
app.get('/register', (req, res) => {
	let userId = req.session.userId;
	if (userId) {
		res.redirect('/urls');
	} else {
		let templateVars = {
			user: users[userId]
		};
		res.render('urls_register', templateVars);
	}
});

//Create Short URL Page
app.get('/urls/new', (req, res) => {
	const userId = req.session.userId;
	if (!userId) {
		res.redirect('/login');
	} else {
		const templateVars = {
			user: users[userId]
		};
		res.render('urls_new', templateVars);
	}
});

//shortURL
app.get('/urls/:shortURL', (req, res) => {
	const userId = req.session.userId;	
  const shortURL = req.params.shortURL;
  
  if (userId) { // Checks login
    if (urlDatabase[shortURL]) { // Checks if short URL exists
      const idUrls = urlsForUser(userId,urlDatabase);
      if (idUrls[shortURL]) { // Cheks if short url belongs to this user
        const templateVars = {
          shortURL,
          longURL : urlDatabase[shortURL]['longURL'],
          user: users[userId],
          created: urlDatabase[shortURL]['created'],
        };
				console.log("get surl:", templateVars)
        res.render('urls_show', templateVars);
      } else {
        res.status(401).send("Please <a href='/login'> login</a> first");
      }
    } else {
      res.send(`Error: This short URL does not exist.`);
    }
  } 
});

// Redirects short URL clicks to the long links
app.get('/u/:shortURL', (req, res) => {
	const shortURL = req.params.shortURL;
	if (urlDatabase[shortURL]) {
		const longURL = urlDatabase[shortURL].longURL;
		res.redirect(longURL);
	} else {
		res.send(`Error: This short URL does not exist.`);
	}
});

//********************* Post ****************************//

//create short URL
app.post('/urls', (req, res) => {
	const userId = req.session.userId;
	const shortURL = generateRandomString();
	const longURL = req.body.longURL;

	if (!userId) {
		return res.status(401).send("Please login first");
	}
	urlDatabase[shortURL] = {
		userId,
		longURL,
		created: new Date(),
	};
	res.redirect(`/urls/${shortURL}`);
});

// login info
app.post('/login', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const user = findUserByEmail(email, users);
	if (!email || !password) {
		return res.status(400).send(" Email and password cannot be blank. Please <a href='/login'> login again</a>");
	}
	if (!user) {
		return res.status(400).send("Invalid credentials.Please <a href='/login'>login again</a>");
	}

	bcrypt.compare(password, user.password, (err, success) => {
		if (!success) {
			return res.status(400).send('password does not match');
		}
		req.session.userId = user.id;
		res.redirect('/');
	});
});

// Register check-in
app.post('/register', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const user = findUserByEmail(email, users);
	if (!email || !password) {
		return res.status(400).send("Missing Email or Password. Please <a href='/register'> try again </a>");
	}
	if (user) {
		res
			.status(403)
			.send(
				"User is already registered!Please <a href='/register'> try again </a> or <a href='/login'> login </a>"
			);
	} else {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(password, salt, (err, hash) => {
				const userId = addNewUser(email, hash, users);
				req.session.userId = userId;
				res.redirect('/');
			});
		});
	}
});

//Logout
app.post('/logout', (req, res) => {
	req.session = null;
	res.redirect('/urls');
});

// Edit URL
app.post('/urls/:shortURL', (req, res) => {
	const userId = req.session.userId;
  const shortURL = req.params.shortURL;
  if (userId) { // Checks login
    if (urlDatabase[shortURL]) { 
      const idUrls = urlsForUser(userId,urlDatabase); 
      if (idUrls[shortURL]) { 
        urlDatabase[shortURL].longURL = req.body.longURL;
        res.redirect('/urls');
      } else { 
        res.send('You are not authorized to update or delete this URL.');
      }
    } else { 
      res.send(`Error: This short URL does not exist.`);
    }
  }
});

//Delete
app.post('/urls/:shortURL/delete', (req, res) => {
	const userId = req.session.userId;
	const shortURL = req.params.shortURL;

	if (!userId) {
		return res.status(401).send('Please login first');
	} else if (!Object.keys(urlDatabase).includes(shortURL)) {
		return res.status(401).send('Error, can not find this shortURL');
	} else if (userId !== urlDatabase[shortURL].userId) {
		return res.status(401).send('Error, can not access this shortURL');
	}
	delete urlDatabase[shortURL];
	res.redirect(`/urls`);
});


