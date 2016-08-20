"use strict";

require('dotenv').config();

const fs = require('fs'),
      _ = require('lodash'),
      POSTS_DIR = process.env.POSTS_DIR,
      DATA_DIR = process.env.DATA_DIR;

function getPosts() {
  return new Promise((resolve, reject) => {
    fs.readdir(POSTS_DIR, (err, names) => {
      if (err) return reject(err);

      const postNames = _.map(names, name => name.replace('.markdown', ''))

      resolve(postNames);
    })
  })
}

function writeComments (files, posts) {
  let obj = {};

  console.log('FILES', files);
  console.log('POSTS', posts);

  for (const file of files) {
    console.log('FILE', file);
    for (const post of posts) {
      console.log('POST', post);
      if (post[0].thread === file) {
        obj[file] = post[0].comments;
      }
    }
  }

  fs.writeFile(`${DATA_DIR}/comments.json`, JSON.stringify(obj, null, 2), err => {
    if (err) return console.log(err);

    console.log("Comments saved");
  });
}

module.exports = {
  getPosts,
  writeComments
};
