const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, addNewUser, findUserByEmail, urlsForUser } = require('./helpers');
//*********************** USE **************************//
app.use(
	cookieSession({
		name: 'session',
		keys: [ 'key1', 'key2' ]
	})
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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

app.get('/', (req, res) => {
	if (req.session.userId) {
		res.redirect('/urls');
	} else {
		res.redirect('/login');
	}
});

app.get('/urls', (req, res) => {
	if (req.session.userId) {
	const userId = req.session.userId;
	const userUrls = urlsForUser(userId, urlDatabase);
	const templateVars = {
		user: users[userId],
		urls: userUrls
	};
	res.render('urls_index', templateVars);
	} else {
		res.redirect('/login');
	}	
});

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
//*************************Short Url & Edit *************************** */
app.get('/urls/:shortURL', (req, res) => {
	if (req.session.userId) {
	const templateVars = {
		shortURL: req.params.shortURL,
		longURL: urlDatabase[req.params.shortURL]['longURL'],
		user: users[req.session.userId]
	};
	res.render('urls_show', templateVars);
	} else {
		return res.status(401).send('To check the shortURL. Please login');
	}
});
app.get('/u/:shortURL', (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL]['longURL'];
	res.redirect(longURL);
});
// Edit LongURL
app.post('/urls/:shortURL', (req, res) => {
	if (req.session.userId) {
		const shortURL = req.params.shortURL;
		urlDatabase[shortURL].longURL = req.body.longURL;
		res.redirect('/urls');
	}else {
		return res.status(401).send('To check the shortURL. Please login');
	}
});

//********************* Post ****************************//
app.post('/urls', (req, res) => {
	if (req.session.userId) {
		const shortURL = generateRandomString();
		const longURL = req.body.longURL;
		urlDatabase[shortURL] = {
			longURL: longURL,
			userId: req.session.userId
		};
		res.redirect(`/urls/${shortURL}`);
	} else {
		res.redirect(403, '/urls');
	}
});

//********************* Login ****************************//

app.get('/login', (req, res) => {
	let userId = req.session.userId;
	let templateVars = {
		user: users[userId]
	};
	res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const user = findUserByEmail(email, users);
	if (!email || !password) {
		return res.status(400).send('email and password cannot be blank');
	}
	if (!user) {
		return res.status(400).send('no user with that email found');
	}
	bcrypt.compare(password, user.password, (err, success) => {
		if (!success) {
			return res.status(400).send('password does not match');
		}
		req.session.userId = user.id;
		res.redirect('/');
	});
});
//********************* Register **************************//
app.get('/register', (req, res) => {
	let userId = req.session.userId;
	let templateVars = {
		urls: urlDatabase,
		user: users[userId]
	};
	res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
	// const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const user = findUserByEmail(email, users);
	if (!user) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(password, salt, (err, hash) => {
				const userId = addNewUser(email, hash, users);
				res.cookie('user_id', userId);
				res.redirect('/');
			});
		});
	} else {
		res.status(403).send('User is already registered! Please Login');
	}
});
//check users in json
app.get('/users.json', (req, res) => {
	res.json(users);
});

//************************ Logout *************************//
app.post('/logout', (req, res) => {
	req.session = null;
	res.redirect('/urls');
});
//************************ Delete *************************//
app.post('/urls/:shortURL/delete', (req, res) => {
	const shortURL = req.params.shortURL;
	delete urlDatabase[shortURL];
	res.redirect(`/urls`);
});
//********************** Listen ***************************//
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
