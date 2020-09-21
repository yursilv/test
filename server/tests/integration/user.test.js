const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setup-test-db');
const { User } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../utils/db-entries/user');

setupTestDB();

describe('User routes', () => {
  describe('POST /api/users', () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
      };
    });

    test('should return 201 and successfully create new user if data is ok', async () => {
      const res = await request(app).post('/api/users').send(newUser).expect(httpStatus.CREATED);

      expect(res.body).toEqual({ id: expect.anything(), name: newUser.name });

      const dbUser = await User.findById(res.body.id);
      expect(dbUser).toBeDefined();
      expect(dbUser).toMatchObject({ name: newUser.name });
    });
  });

  describe('GET /api/users', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([userOne, userTwo]);

      const res = await request(app).get('/api/users').send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toEqual({
        id: userOne._id.toHexString(),
        name: userOne.name,
      });
    });

    test('should correctly apply filter on name field', async () => {
      await insertUsers([userOne, userTwo]);

      const res = await request(app).get('/api/users').query({ name: userOne.name }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne, userTwo]);

      const res = await request(app).get('/api/users').query({ limit: 1 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne, userTwo]);

      const res = await request(app).get('/api/users').query({ page: 2, limit: 1 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userTwo._id.toHexString());
    });
  });

  describe('GET /api/users/:userId', () => {
    test('should return 200 and the user object if data is ok', async () => {
      await insertUsers([userOne]);

      const res = await request(app).get(`/api/users/${userOne._id}`).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        name: userOne.name,
      });
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([userOne]);

      await request(app).get('/api/users/invalidId').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user is not found', async () => {
      await insertUsers([userTwo]);

      await request(app).get(`/api/users/${userOne._id}`).send().expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /api/users/:userId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne]);

      await request(app).delete(`/api/users/${userOne._id}`).send().expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeNull();
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([userOne]);

      await request(app).delete('/api/users/invalidId').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user already is not found', async () => {
      await insertUsers([userTwo]);

      await request(app).delete(`/api/users/${userOne._id}`).send().expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/users/:userId', () => {
    test('should return 200 and successfully update user if data is ok', async () => {
      await insertUsers([userOne]);
      const updateBody = {
        name: faker.name.findName(),
      };

      const res = await request(app).patch(`/api/users/${userOne._id}`).send(updateBody).expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        name: updateBody.name,
      });

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser).toMatchObject({ name: updateBody.name });
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([userOne]);
      const updateBody = { name: faker.name.findName() };

      await request(app).patch(`/api/users/invalidId`).send(updateBody).expect(httpStatus.BAD_REQUEST);
    });
  });
});
