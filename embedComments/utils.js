"use strict";
require('dotenv').config();

const _ = require('lodash'),
      util = require('util'),
      ENDPOINTS = require('./endpoints'),
      API_SECRET = process.env.API_SECRET,
      REQUEST_LIMIT = 50;

function getOptions(path, params) {
  let _path = `${ENDPOINTS.basePath + path }?`;
  let defaultParams = [`api_secret=${API_SECRET}`, `limit=${REQUEST_LIMIT}`];
  _path += defaultParams.concat(params).join('&');

  return {
      host: ENDPOINTS.root,
      port: 443,
      path: _path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
  };
};

function removeEmptyThreads (threads) {
  return _
    .chain(threads)
    .filter('posts')
    .map(t => _.pick(t, ['id', 'link']))
    .value();
}

function formatComments (comments) {
  return _
    .chain(comments)
    .filter(comment => !comment.isDeleted && !comment.isSpam)
    .map(comment => ({
      message: comment.raw_message,
      author: comment.author.name || comment.author.username,
      date: comment.createdAt
    }))
    .value();
}

function logger (data) {
  console.log(util.inspect(data, false, null));
  return data;
}

module.exports = {
  removeEmptyThreads,
  getOptions,
  formatComments,
  logger
};
