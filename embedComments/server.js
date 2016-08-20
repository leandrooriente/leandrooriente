"use strict";

const _ = require('lodash');
const Promise = require('promise');

const getThreads = require('./threads');
const posts = require('./posts');
const getCommentsByThread = require('./comments');
const utils = require('./utils');

function getComments () {
  return new Promise((resolve, reject) => {
    getThreads()
      .then(getCommentsByThread)
      .then(comments => resolve(comments));
  })
}

posts.getPosts()

Promise.all([
  posts.getPosts(),
  getComments()
]).then(data => {
  posts.writeComments(data[0], data[1]);
})
