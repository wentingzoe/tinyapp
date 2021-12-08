const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
//*************************************************//
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
//*************************************************//
//Generate a Random ShortURL
const generateRandomString = function() {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < 6; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

//*************************************************//
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
	'9sm5xK': 'http://www.google.com'
};

//*************************************************//

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
	const templateVars = { urls: urlDatabase,
	username: req.cookies["username"] };
	res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
	const templateVars = {
		username: req.cookies["username"] };
	res.render('urls_new',templateVars);
});

//*************************************************//
app.get('/urls/:shortURL', (req, res) => {
	const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
	username: req.cookies["username"] };
	res.render('urls_show', templateVars);
});
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
//*************************************************//

app.post('/urls', (req, res) => {
	const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
	
});
//************************Login*************************//

app.post('/login', (req, res) => {
	const username = req.body.username;
	res.cookie('username', username);
	res.redirect('/urls');
});

//*************************Logout************************//
app.post('/logout', (req, res) => {
	res.clearCookie('username');
  res.redirect('/urls');
});
//*************************************************//
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});
//*************DELETE**********************************//
app.post('/urls/:shortURL/delete',(req, res)=>{
	const shortURL = req.params.shortURL;
	delete urlDatabase[shortURL];
	res.redirect(`/urls`);
})
//*************************************************//
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
