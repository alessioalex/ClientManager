process.env.NODE_ENV = 'test';

var async    = require('async'),
    colors   = require('colors'),
    should   = require('should'),
    moment   = require('moment'),
    mongoose = require('mongoose'),
    request  = require('request'),
    _        = require('underscore'),
    root     = __dirname + '/../../../',
    utils    = require(root + 'lib/utils'),
    cleanDb  = utils.cleanDb,
    v1       = '/api/v1',
    ENV, AppEmitter, Client, appUrl, clientsBulk, config, appServ;

ENV = process.env.NODE_ENV;
AppEmitter = require(root + 'app');

describe('Controllers::Errors', function() {

  before(function(done) {
    utils.loadConfig(root + 'config', function(conf) {
      var calledApp = false;

      config = conf;
      appUrl = conf.site_url + "/api/v1";

      AppEmitter.on('getApp', function(app) {
        if (calledApp) { return false; }

        calledApp = true;
        appServ = app;
        app.listen(config[ENV].PORT);
        done();
      });
      AppEmitter.emit('checkApp');
    });
  });

  after(function(done) {
    var closedApp = false;

    mongoose.disconnect();
    appServ.on('close', function() {
      setTimeout(function() {
        if (!closedApp) {
          done();
          closedApp = true;
        }
      }, 500);
    });
    appServ.close();
  });

  it("should return 404 for non-existing pages", function(done) {
    async.parallel([
      function get404(callback) {
        request(appUrl + '/clients/kjsdflkjslkjdljsdlkjflskj', function(err, res, body) {
          callback(err, res.statusCode);
        });
      },
      function post404(callback) {
        request({
          method : "POST",
          url    : appUrl + '/clients/kajshdkjhsdkjfhskjdhfkjhsdk',
          form   : {}
        }, function(err, res, body) {
          callback(err, res.statusCode);
        });
      },
      function put404(callback) {
        request({
          method : "PUT",
          url    : appUrl + '/cliekajshdkjhsdkjfhskjdhfkjhsdk',
          form   : {}
        }, function(err, res, body) {
          callback(err, res.statusCode);
        });
      },
      function del404(callback) {
       request.del(appUrl + '/cliekajshdkjhsdkjfhskjdhfkjhsdk', function(err, res, body) {
         callback(err, res.statusCode);
       });
      }
    ], function(err, results) {
      if (err) { throw err; }

      results.forEach(function(code) {
        code.should.equal(404);
      });

      done();
    });
  });

  it("should return 500 when internal error encountered", function(done) {
    request(appUrl.replace('/api/v1', '') + '/test_500_page', function(err, res, body) {
      if (err) { throw err; }

      res.statusCode.should.equal(500);
      done();
    });
  });

});
