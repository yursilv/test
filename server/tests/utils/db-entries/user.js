const mongoose = require('mongoose');
const faker = require('faker');
const User = require('../../../src/models/user.model');

const userOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
};

const userTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
};

const insertUsers = async (users) => {
  await User.insertMany(users.map((user) => ({ ...user })));
};

module.exports = {
  userOne,
  userTwo,
  insertUsers,
};
