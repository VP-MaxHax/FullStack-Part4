const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    const mostLikes = Math.max(...blogs.map(blog => blog.likes))
    return blogs.find(blog => blog.likes === mostLikes)
}

const mostBlogs = (blogs) => {
    const authorBlogCounts = lodash.countBy(blogs, 'author');
    const maxBlogsAuthor = lodash.maxBy(Object.keys(authorBlogCounts), (author) => authorBlogCounts[author]);
    return {
      author: maxBlogsAuthor,
      blogs: authorBlogCounts[maxBlogsAuthor]
    }
  }

  const mostLikes = (blogs) => {
    const authorLikes = lodash.groupBy(blogs, 'author');
    const likesSumByAuthor = lodash.mapValues(authorLikes, (authorBlogs) => lodash.sumBy(authorBlogs, 'likes'));
    const maxLikesAuthor = lodash.maxBy(Object.keys(likesSumByAuthor), (author) => likesSumByAuthor[author]);
    return {
      author: maxLikesAuthor,
      likes: likesSumByAuthor[maxLikesAuthor]
    }
  }
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }