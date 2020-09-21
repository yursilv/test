const mongoose = require('mongoose');
const faker = require('faker');
const User = require('../models/user.model');

module.exports = async () => {
  await User.insertMany([
    {
      _id: mongoose.Types.ObjectId(),
      name: faker.name.findName(),
    },
    {
      _id: mongoose.Types.ObjectId(),
      name: faker.name.findName(),
    },
  ]);
};
