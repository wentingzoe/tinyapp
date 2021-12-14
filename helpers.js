
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
	for (const userId in db) {
		if (db[userId].email === email) {
			return db[userId];
		}
	}
	return false;
};

function urlsForUser(id, urlDatabase) {
	let result = {};
	for (const key in urlDatabase) {
		if (urlDatabase[key].userId === id) {
			result[key] = urlDatabase[key];
		}
	}
	console.log('user URL:', result);
	return result;
}

// Returns creation date, total visits and unique visitors for userID
const dateVisitInfoForUser = function(filteredUrlObject, urlDB) {
  const output = {};

  for (let key in filteredUrlObject) {
    for (let shortURL in urlDB) {
      if (key === shortURL) {
        output[key] = {
          created: urlDB[key]['created'],
          visits: urlDB[key]['visits'],
          visitors: urlDB[key]['visitors']
        };
      }
    }
  }

  return output;
};

module.exports = {
  generateRandomString,
  addNewUser,
  findUserByEmail,
  urlsForUser,
	dateVisitInfoForUser 
};