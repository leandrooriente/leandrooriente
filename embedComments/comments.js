"use strict";
require('dotenv').config();

const https = require('https'),
      _ = require('lodash'),
      Promise = require('promise'),
      utils = require('./utils'),
      ENDPOINTS = require('./endpoints'),
      FORUM = process.env.FORUM;


function iterateComments (thread, id, cursor, partial, callback) {
  partial = partial || [];

  let params = [];
  params.push(`forum=${FORUM}`);
  params.push(`thread=${id}`);
  if (cursor) params.push('cursor=' + cursor);

  const options = utils.getOptions(ENDPOINTS.comments, params);

  https.get(options, res => {
    res.setEncoding('utf-8');

    console.log('REQUEST COMMENT WITH THREAD: ', thread, ' AND ID: ', id);
    console.log('REQUEST STATUS: ', res.statusCode);

    let accumulator = '';
    res.on('data', data => accumulator += data);

    res.on('end', () => {
      const data = JSON.parse(accumulator);
      const comments = partial.concat(data.response);

      if (!data.cursor.hasNext) {
        return callback({ thread, comments: utils.formatComments(comments) });
      }
      iterateComments(thread, id, data.cursor.next, comments, callback);
    });
  });
}

function getComments (thread, id) {
  const options = utils.getOptions(ENDPOINTS.comments, [`forum=${FORUM}`, `thread=${id}`]);
  return new Promise((resolve, reject) => {
    iterateComments(thread, id, null, null, resolve);
  });
}

function getCommentsByThreadId (thread, ids) {
  return new Promise ((resolve, reject) => {
    let promises = [];
    for (let id of ids) {
      promises.push(getComments(thread, id));
    };

    Promise.all(promises)
      .done(function(data){
        resolve(data);
      });
  })

}

function getCommentsByThread(threads) {
  return new Promise((resolve, reject) => {
    const map = {};
    const promises = [];

    for (let thread in threads) {
      const ids = threads[thread];
      promises.push(getCommentsByThreadId(thread, ids));
    }

    Promise.all(promises)
      .done(data => {
        resolve(data);
      });
  });
}

module.exports = getCommentsByThread;
