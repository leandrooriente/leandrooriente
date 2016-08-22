// ADD HASH TO CLEAN BROWSER CACHE. UPDATE HASH EVERY MINUTE

var fs = require('fs'),
  path = require('path'),
  util = require('hexo-util');

hexo.extend.helper.register('staticVersion', function(file) {
  var dir = file.split('/');
  var ext = path.extname(file);
  var date = new Date();
  var version = date.getDate().toString() + date.getMonth().toString() + date.getFullYear().toString() + date.getHours().toString() + date.getMinutes().toString();
  var versionedFile = file + '?v=' + version;
  return ext === '.js' ? '<script src="' + versionedFile + '"></script>' : '<link rel="stylesheet" href="' + versionedFile + '">';
});
