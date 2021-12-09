//******************** function *****************************//
//Generate a Random ShortURL
const generateRandomString = function() {
	const shortURL = Math.random().toString(36).substring(2, 8);
	return shortURL;
};
const addNewUser = (email, password,db) => {
	const userId = Math.random().toString(36).substring(2, 8);
	const newUser = {
		id: userId,
		email,
		password
	};
	db[userId] = newUser;
	return userId;
};
const findUserByEmail = (email,db) => {
	for (let userId in db) {
		if (db[userId].email === email) {
			return db[userId];
		}
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
module.exports = {
  generateRandomString,
  addNewUser,
  findUserByEmail,
  urlsForUser
};