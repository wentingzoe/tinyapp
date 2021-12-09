const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
//const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser');
//*********************** USE **************************//
// app.use(
//   cookieSession({
//     name: 'session',
//     keys: ['key1', 'key2','key3'],
//     maxAge: 24 * 60 * 60 * 1000
//   })
// );
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
function urlsForUser(id, urlDatabase) {
	let result = {};
	for (key in urlDatabase) {
		if (urlDatabase[key].userId === id) {
			result[key] = urlDatabase[key];
		}
	}
	console.log('user URL:', result);
	return result;
}
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
		password: '1234'
	},
	'1dc937ec': {
		id: '1dc937ec',
		email: 'good.philamignon@steak.com',
		password: 'meatlover'
	}
};

//********************** Get ***************************//

app.get('/', (req, res) => {
	res.redirect('/register');
});
app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
	const templateVars = { greeting: 'Hello World!' };
	res.render('hello_world', templateVars);
});

app.get('/urls', (req, res) => {
	const userId = req.cookies['user_id'];
	const userUrls = urlsForUser(userId, urlDatabase);
	const templateVars = {
		user: userId,
		urls: userUrls
	};
	console.log('urls:', templateVars);
	res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
	const userId = req.cookies['user_id'];
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
	const templateVars = {
		shortURL: req.params.shortURL,
		longURL: urlDatabase[req.params.shortURL]['longURL'],
		user: req.cookies['user_id']
	};
	res.render('urls_show', templateVars);
});
app.get('/u/:shortURL', (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL]['longURL'];
	res.redirect(longURL);
});
// Edit LongURL
app.post('/urls/:shortURL', (req, res) => {
	const shortURL = req.params.shortURL;
	urlDatabase[shortURL].longURL = req.body.longURL;
	res.redirect('/urls');
});
//********************* Post ****************************//

app.post('/urls', (req, res) => {
	if (req.cookies['user_id']) {
		const shortURL = generateRandomString();
		const longURL = req.body.longURL;
		urlDatabase[shortURL] = {
			longURL: longURL,
			userId: req.cookies['user_id']
		};
		res.redirect(`/urls/${shortURL}`);
	} else {
		res.redirect(403, '/urls');
	}
});

//********************* Login ****************************//

app.get('/login', (req, res) => {
	let userId = req.cookies['user_id'];
	let templateVars = {
		user: userId
	};
	res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const checkUserId = authenticateUser(email, password);
	if (checkUserId) {
		res.cookie('user_id', checkUserId);
		res.redirect('/urls');
	} else {
		res.status(401).send('Wrong credentials! Please check your email or password');
	}
});
//********************* Register **************************//
app.get('/register', (req, res) => {
	let userId = req.cookies['user_id'];
	let templateVars = {
		urls: urlDatabase,
		user: userId
	};
	res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
	// const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const user = findUserByEmail(email);
	if (!user) {
		const userId = addNewUser(email, password);
		res.cookie('user_id', userId);
		res.redirect('/urls');
	} else {
		res.status(403).send('User is already registered!Please Login');
	}
});
//check users in json
app.get('/users.json', (req, res) => {
	res.json(users);
});

//************************ Logout *************************//
app.post('/logout', (req, res) => {
	// req.session = null;
	res.clearCookie('user_id');
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
