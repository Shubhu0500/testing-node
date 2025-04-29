require('dotenv').config();

const MONGODB_uri = process.env.MONGODB_SRV;

const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
// const POst = require('../models/post');
const FeedController = require('../controllers/feed');

describe('Feed Controller', function () {
  before(function (done) {
    mongoose
      .connect(MONGODB_uri)
      .then((result) => {
        const user = new User({
          email: 'test@test.com',
          password: 'test1234',
          name: 'Test',
          posts: [],
          _id: '67f2721fcf7f20cc4249c17a',
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });
  it('should add a created post to the posts of the creator', function (done) {
    const req = {
      body: {
        title: 'Test Post',
        content: 'A test Post',
      },
      file: {
        path: 'abc',
      },
      userId: '67f2721fcf7f20cc4249c17a',
    };

    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    };

    FeedController.createPost(req, res, () => {}).then((savedUser) => {
      expect(savedUser).to.have.property('posts');
      expect(savedUser.posts).to.have.length(1);
      done();
    });
  });

  after(function (done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
