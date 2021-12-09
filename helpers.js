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