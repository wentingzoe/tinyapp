const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, addNewUser, findUserByEmail, urlsForUser } = require('./helpers');
const methodOverride = require('method-override');

//*********************** USE **************************//
app.use(
	cookieSession({
		name: 'session',
		keys: [ 'key1', 'key2' ]
	})
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

//************************** Database ***********************//

//url database
const urlDatabase = {
	b6UTxQ: {
		longURL: 'https://www.tsn.ca',
		userId: 'aJ48lW'
	},
	i3BoGr: {
		longURL: 'https://www.google.ca',
		userId: 'aJ48lW'
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
	if (req.session.userId) {
		res.redirect('/urls');
	} else {
		res.redirect('/login');
	}
});

// urls page
app.get('/urls', (req, res) => {
	const userId = req.session.userId;
	const userUrls = urlsForUser(userId, urlDatabase);
	if (!userId) {
		return res.status(401).send("Please <a href='/login'> login</a> first");
	}
	const templateVars = {
		user: users[userId],
		urls: userUrls
	};
	res.render('urls_index', templateVars);
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
	if (!userId) {
		return res.status(401).send("Please <a href='/login'> login</a> first");
	} else if (!Object.keys(urlDatabase).includes(shortURL)) {
		return res.status(401).send('Error, can not find this shortURL');
	} else if (userId !== urlDatabase[shortURL].userId) {
		return res.status(401).send('Error, can not access this shortURL');
	}
	const templateVars = {
		shortURL,
		longURL: urlDatabase[shortURL].longURL,
		user: users[userId]
	};
	res.render('urls_show', templateVars);
});

// LongURL
app.get('/u/:shortURL', (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL].longURL;
	res.redirect(longURL);
});

// Login page
app.get('/login', (req, res) => {
	let userId = req.session.userId;
	let templateVars = {
		user: users[userId]
	};
	res.render('urls_login', templateVars);
});

// Register Page
app.get('/register', (req, res) => {
	let userId = req.session.userId;
	let templateVars = {
		urls: urlDatabase,
		user: users[userId]
	};
	res.render('urls_register', templateVars);
});

//********************* Post ****************************//

// Edit URL
app.post('/urls/:shortURL', (req, res) => {
	const userId = req.session.userId;
	const shortURL = req.params.shortURL;
	if (!userId) {
		return res.status(401).send("Please <a href='/login'> login</a> first");
	} else if (!Object.keys(urlDatabase).includes(shortURL)) {
		return res.status(401).send('Error, can not find this shortURL');
	} else if (userId !== urlDatabase[shortURL].userId) {
		return res.status(401).send('Error, can not access this shortURL');
	}

	urlDatabase[shortURL].longURL = req.body.longURL;
	res.redirect('/urls');
});

//create short URL
app.post('/urls', (req, res) => {
	const userId = req.session.userId;
	const shortURL = generateRandomString();
	const longURL = req.body.longURL;

	if (!userId) {
		return res.status(401).send("Please <a href='/login'> login</a> first");
	}

	urlDatabase[shortURL] = {
		longURL: longURL,
		userId: req.session.userId
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
	if (!user) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(password, salt, (err, hash) => {
				const userId = addNewUser(email, hash, users);
				res.cookie('user_id', userId);
				res.redirect('/');
			});
		});
	} else {
		res
			.status(403)
			.send(
				"User is already registered!Please <a href='/register'> try again </a> or <a href='/login'> login </a>"
			);
	}
});

//Logout
app.post('/logout', (req, res) => {
	req.session = null;
	res.redirect('/');
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

//********************** Listen ***************************//
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
