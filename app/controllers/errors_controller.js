var utils    = require('../../lib/utils'),
    NotFound = utils.NotFound,
    log      = require('../../lib/logger'),
    ErrorsController;

ErrorsController = function(app, mongoose) {

  // only for test environment
  utils.ifEnv('test', function() {
    app.get('/test_500_page', function(req, res, next) {
      next(new Error('test'));
    });
  });

  app.all('*', function(req, res, next) {
    throw new NotFound();
  });

  app.error(function(err, req, res, next) {
    if (err instanceof NotFound) {
      if (err.msg && err.msg === 'json') {
        res.json(null, 404);
      } else {
        res.send('404 - Page Not Found', 404);
      }
    } else {
      log.err(err);
      res.send('500 - Internal Server Error', 500);
    }
  });

};

module.exports = ErrorsController;
