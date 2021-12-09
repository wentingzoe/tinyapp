const { assert } = require('chai');

const { findUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
	userRandomID: {
		id: 'userRandomID',
		email: 'user@example.com',
		password: 'purple-monkey-dinosaur'
	},
	user2RandomID: {
		id: 'user2RandomID',
		email: 'user2@example.com',
		password: 'dishwasher-funk'
	}
};

describe('findUserByEmail', function() {
	it('should return a user with valid email', function() {
		const user = findUserByEmail('user@example.com', testUsers);
		const expectedUserID = 'userRandomID';
		console.log(user.id);
		assert.deepEqual(expectedUserID, user.id);
	});
	it(`should return "undefined"`, function() {
		const user = findUserByEmail('test@test.com', testUsers);
		const expectedOutput = undefined;
		assert.deepEqual(expectedOutput, user.id);
	});
});
describe('testing urlsForUser', () => {
	it('return a url for existing id', () => {
		const equalDatabase = {
			'1233': {
				longURL: 'http://google.com',
				userId: 'user1'
			}
		};
		const url = urlsForUser('user1', equalDatabase);
		assert.deepEqual(url, equalDatabase);
	});

	it('return empty dictionary for non existent id', () => {
		const equalDatabase2 = {};
		const url2 = urlsForUser('user', equalDatabase2);
		assert.deepEqual(url2, equalDatabase2);
	});
});
