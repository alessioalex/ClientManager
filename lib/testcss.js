var async  = require('async'),
    fs     = require('fs'),
    cssMin = require('./cssmin'),
    cssConfig, filePaths;

// cssConfig a la RequireJS optimizer
cssConfig = {
  baseUrl : '../public/css',
  files   : ['bootstrap', 'style'],
  out     : '../public/build/main-built.css'
};

// construct the file paths
filePaths = [];
cssConfig.files.forEach(function(file) {
  filePaths.push(__dirname + '/' + cssConfig.baseUrl + '/' + file + '.css');
});

async.map(filePaths, function minimizeCss(item, callback) {
  fs.readFile(item, 'UTF-8', function(err, contents) {
    if (err) {
      callback(err, null);
    } else {
      // return minified contents
      callback(null, cssMin(contents));
    }
  });
}, function writeToFile(err, results) {
  var filePath;

  if (err) { throw err; }

  filePath = __dirname + '/' + cssConfig.out;
  fs.writeFile(filePath, results.join('\n'), 'UTF-8', function(err) {
    if (err) { throw err; }

    // TODO: callback here
  });
});
