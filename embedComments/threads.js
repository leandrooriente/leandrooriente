"use strict";
require('dotenv').config();

const https = require('https'),
      _ = require('lodash'),
      Promise = require('promise'),
      utils = require('./utils'),
      ENDPOINTS = require('./endpoints'),
      FORUM = process.env.FORUM;


function getThreadsMap (threads) {
  const cleanThreads = utils.removeEmptyThreads(threads);
  const threadMap = _.reduce(cleanThreads, (map, t) => {
    // Remove hostname and querystrings
    const cleanPath = t.link.split('/')[3];

    if (map[cleanPath]) {
      map[cleanPath].push(t.id);
    } else {
      map[cleanPath] = [t.id];
    }

    return map;
  }, {});

  return threadMap;
}


function iterateThreads (cursor, partial, callback) {
  partial = partial || {};

  let params = [`forum=${FORUM}`];
  if (cursor) params.push('cursor=' + cursor);

  const options = utils.getOptions(ENDPOINTS.threads, params);
  https.get(options, res => {
    res.setEncoding('utf-8');

    console.info('REQUEST THREAD LIST', cursor);
    console.log('REQUEST STATUS: ', res.statusCode);

    let accumulator = '';
    res.on('data', data => accumulator += data);

    res.on('error', err => console.log(err));

    res.on('end', () => {
      const data = JSON.parse(accumulator);
      const map = _.extend({}, partial, getThreadsMap(data.response))

      if (!data.cursor.hasNext) return callback(map);
      iterateThreads(data.cursor.next, map, callback);
    });
  });
}

function getThreads() {
  return new Promise((resolve, reject) => {
    iterateThreads(null, null, resolve)
  });
}

module.exports = getThreads;
