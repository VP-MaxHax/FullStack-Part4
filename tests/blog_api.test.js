const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, 6)
})

test('id is defined', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body[0].id, "5a422a851b54a676234d17f7")
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: "Tieteetön blogi",
    author: "Matti Meikäläinen",
    url: "http://www.tieteetonblogi.fi",
    likes: 0,
  }
  await api
  .post('/api/blogs')
  .send(newBlog)

  const response = await api.get('/api/blogs')  
  const title = response.body.map(r => r.title)  
  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)  
  assert(title.includes('Tieteetön blogi'))
})

test('likes default to 0', async () => {
  const newBlog = {
    title: "Tieteetön blogi",
    author: "Matti Meikäläinen",
    url: "http://www.tieteetonblogi.fi",
  }
  await api
  .post('/api/blogs')
  .send(newBlog)

  const response = await api.get('/api/blogs')
  const title = response.body.map(r => r.title)
  const likes = response.body.map(r => r.likes)
  assert.strictEqual(title[6], 'Tieteetön blogi')
  assert.strictEqual(likes[6], 0)
})

test('blog title is required', async () => {
  const newBlog = {
    author: "Matti Meikäläinen",
    url: "http://www.tieteetonblogi.fi",
  }
  await api
  .post('/api/blogs')
  .send(newBlog)
  .expect(400)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('blog url is required', async () => {
  const newBlog = {
    title: "Tieteetön blogi",
    author: "Matti Meikäläinen",
  }
  await api
  .post('/api/blogs')
  .send(newBlog)
  .expect(400)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('succeeds with status code 204 if id is valid', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

  const title = blogsAtEnd.map(r => r.title)
  assert(!title.includes(blogToDelete.title))
})

test.only('succeeds with status code 200 if id is valid', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  const updatedBlog = {
    title: blogToUpdate.title,
    author: blogToUpdate.author,
    url: blogToUpdate.url,
    likes: 999,
  }
  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()
  const likes = blogsAtEnd.map(r => r.likes)
  assert(likes.includes(999))
})

after(async () => {
  await mongoose.connection.close()
})