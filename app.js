var connect        = require('connect'),
    express        = require('express'),
    connectTimeout = require('connect-timeout'),
    mongoose       = require('mongoose'),
    gzippo         = require('gzippo'),
    utils          = require('./lib/utils'),
    EventEmitter   = require('events').EventEmitter,
    AppEmitter     = new EventEmitter(),
    app            = express.createServer(),
    ENV            = process.env.NODE_ENV || 'development',
    log            = console.log,
    dbPath;

utils.loadConfig(__dirname + '/config', function(config) {
  app.use(function(req, res, next) {
    res.removeHeader("X-Powered-By");
    next();
  });
  app.configure(function() {
    utils.ifEnv('production', function() {
      // enable gzip compression
      app.use(gzippo.compress());
    });
    app.use(express.favicon());
    app.use(express['static'](__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    utils.ifEnv('production', function() {
      app.use(connectTimeout({
        time: parseInt(config[ENV].REQ_TIMEOUT, 10)
      }));
    });
  });

  mongoose = utils.connectToDatabase(mongoose, config.db[ENV].main);

  // register models
  require('./app/models/client')(mongoose);

  // register controllers
  ['clients', 'errors'].forEach(function(controller) {
    require('./app/controllers/' + controller + '_controller')(app, mongoose, config);
  });

  app.on('error', function (e) {
    if (e.code == 'EADDRINUSE') {
      log('Address in use, retrying...');
      setTimeout(function () {
        app.close();
        app.listen(config[ENV].PORT, function() {
          app.serverUp = true;
        });
      }, 1000);
    }
  });

  if (!module.parent) {
    app.listen(config[ENV].PORT, function() {
      app.serverUp = true;
    });
    log('Express server listening on port %d, environment: %s', app.address().port, app.settings.env);
  }

  AppEmitter.on('checkApp', function() {
    AppEmitter.emit('getApp', app);
  });

});

/**
 * export AppEmitter for external services so that the callback can execute
 * when the app has finished loading the configuration
 */
module.exports = AppEmitter;
