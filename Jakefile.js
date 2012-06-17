/**
 * Jake is a JavaScript build tool for Node.js
 * http://howtonode.org/intro-to-jake
 * https://github.com/mde/jake
 *
 * To find out the available tasks for Jake run:
 * jake -T
 *
 * To run a task do:
 * jake db:reset
 *
 * To run a task with params do:
 * jake db:populate[20]
 */
var mongoose     = require('mongoose'),
    colors       = require('colors'),
    faker        = require('./vendor/faker'),
    assetBuilder = require('./lib/assetBuilder'),
    log          = console.log,
    ENV          = process.env.NODE_ENV || 'development';
    JK           = {};

JK.abortIfProduction = function() {
  if (ENV === 'production') {
    throw new Error('Are you out of your mind? Drop the production db?!');
  }
}

// desc('Initialize stuff.');
task('init', [], function() {
  JK.utils = JK.utils || require('./lib/utils');
  // make sure the configs are loaded only once
  if (!JK.config) {
    JK.utils.loadConfig(__dirname + '/config', function(config) {
      JK.config = config;
      complete();
    });
  }
}, { async: true });

namespace('app', function() {

  desc('Compress JS & CSS and make 1 JS && 1 CSS file. Run this before deploying to production.');
  task('assets', [], function(done) {
    assetBuilder(function() {
      log('- packed up JS & CSS files'.yellow);
      complete();
    });
  }, { async: true });

});

namespace('db', function() {

  // desc('Connect to database');
  task('connect', ['init'], function() {
    var _self = this;

    log('- db:connect'.yellow);
    if (!JK.mongoose) {
      JK.mongoose = JK.utils.connectToDatabase(mongoose, JK.config.db[ENV].main, function(err) {
        if (err) { throw err; }

        log('  connected to database'.green);
        complete.call(_self);
      });
    } else {
      complete();
    }
  }, { async: true });

  // desc('Load models');
  task('loadModels', [], function(params) {
    log('- db:loadModels'.yellow);
    if (!JK.models) {
      JK.models = {};
      ['client'].forEach(function (elem, index) {
        JK.models[elem] = require('./app/models/' + elem)(JK.mongoose);
      });
    }
    log('  loaded models'.green);
  });

  desc('Remove all items from the database.');
  task('empty', ['db:connect', 'db:loadModels'], function(params) {
    var Client, query;

    log('- db:empty'.yellow);

    Client = JK.models.client;
    query = Client.find().remove(function(err) {
      if (err) { throw err; }

      log('  emptied db'.green);
      complete();
    });
  }, { async: true });

  // Run jake db:populate OR jake db:populate[<numberOfItems>]
  desc('Populate db with phony data.');
  task('populate', ['db:empty'], function(howMany) {
    var Client;

    log('- db:populate'.yellow);

    Client  = JK.models.client;
    howMany = howMany || 50;

    (function populate(nr) {
      var client, _now, _pastDate;

      if (nr === 0) {
        log(('  populated ' + ENV + ' database').green);
        process.exit(0);
      }

      _now      = JK.utils.getRandDate();
      // client has to be older than 18 years -> 18 * 12 = 216
      _pastDate = JK.utils.getRandDate('past', _now, {
        timeUnit : 'months',
        timeVal  : (18 + parseInt(nr, 10)) * 12,
      });

      client = new Client({
        name    : faker.Name.findName(),
        email   : faker.Internet.email(),
        born    : _pastDate,
        company : faker.Company.companyName()
      });

      client.save(function(err) {
        if (err) {
          // Faker sometimes generates bad emails
          if (err.errors && err.errors.email) {
            nr++;
          } else {
            throw err;
          }
        }

        nr--;
        process.nextTick(function() {
          populate(nr);
        });
      });
    }(howMany));
  });
});
