var async  = require('async'),
    cssMin = require('./cssmin'),
    fs        = require('fs'),
    requirejs = require('requirejs'),
    jsConfig, cssConfig, filePaths, actionsLeft, assetBuilder;

actionsLeft = 2;

jsConfig = {
  baseUrl : __dirname + '/../public/js',
  name    : 'main',
  out     : __dirname + '/../public/build/main-built.js',
  paths: {
    'text'             : 'lib/text',
    'jquery'           : 'lib/jquery',
    'underscore'       : 'lib/underscore-amd',
    'backbone'         : 'lib/backbone-amd',
    'bootstrap'        : 'lib/bootstrap',
    'moment'           : 'lib/moment',
    'ClientModel'      : 'models/client',
    'ClientCollection' : 'collections/clients',
    'HomeView'         : 'views/home',
    'HeaderView'       : 'views/header',
    'ClientListView'   : 'views/clients/index',
    'ClientEditView'   : 'views/clients/edit',
    'ClientView'       : 'views/clients/show'
  }
};

// cssConfig a la RequireJS optimizer
cssConfig = {
  baseUrl : '../public/css',
  files   : ['bootstrap', 'style'],
  out     : '../public/build/main-built.css'
};

assetBuilder = function(callback) {
  requirejs.optimize(jsConfig, function (buildResponse) {
    // buildResponse is just a text output of the modules
    // included. Load the built file for the contents.
    // Use config.out to get the optimized file contents.
    // var contents = fs.readFileSync(jsConfig.out, 'utf8');
    // console.log(contents);
    if (!--actionsLeft) {
      callback();
    }
  });

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

      // execute callback only when both actions have finished
      if (!--actionsLeft) {
        callback();
      }
    });
  });
};

module.exports = assetBuilder;
