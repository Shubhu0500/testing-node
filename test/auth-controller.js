require('dotenv').config();

const MONGODB_uri = process.env.MONGODB_SRV;

const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller- Login', function () {
  it('should throw and error with error code 500 if accessing the database fails', function (done) {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: 'test1234',
      },
    };

    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      done();
    });

    User.findOne.restore();
  });

  it('should send a response with a valid user status for an existing user', function (done) {
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
        const req = { userId: '67f2721fcf7f20cc4249c17a' };
        const res = {
          statusCode: 500,
          userStatus: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.userStatus = data.status;
          },
        };
        AuthController.getUserStatus(req, {}, () => {}).then(() => {
          expect(res.statusCode).to.be.equal(200);
          expect(res.userStatus).to.be.equal('I am new!');
          done();
        });
      })
      .catch((err) => console.log(err));
  });
});
