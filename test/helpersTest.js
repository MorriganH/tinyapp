const { assert } = require('chai');

const { findUser } = require('../helpers');

const testUsers = {
  'user1RandomID': {
    id: 'user1RandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

describe('findUser', () => {

  it('should return a user with valid email', () => {
    const user = findUser('user@example.com', testUsers);
    const expectedUserID = 'user1RandomID';

    assert.deepEqual(user, testUsers[expectedUserID]);
  });

  it('should return null if email is not in database', () => {
    const user = findUser('user3@example.com', testUsers);
    
    assert.isNull(user);
  });
});