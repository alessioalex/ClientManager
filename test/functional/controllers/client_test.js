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

describe('Controllers::Clients', function() {
  var config;

  before(function(done) {
    utils.loadConfig(root + 'config', function(conf) {
      var calledApp = false;

      config = conf;
      appUrl = conf.site_url + "/api/v1";

      AppEmitter.on('getApp', function(app) {
        if (calledApp) { return false; }

        calledApp = true;
        appServ = app;
        app.listen(config[ENV].PORT, function() {
          app.serverUp = true;
        });
        Client  = mongoose.model('Client');

        cleanDb(Client, function() {
          utils.loadFixtures(function(err, clients) {
            if (err) { throw err; }

            clientsBulk = clients;
            utils.bulkInsert(Client, clients, done);
          });
        });
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

  describe('#GET    '.cyan + v1 + '/clients', function() {

    it("should get fixtures", function(done) {
      request(appUrl + '/clients', function(err, res, body) {
        if (err) { throw err; }

        res.statusCode.should.equal(200);
        should.exist(res.headers.etag);
        _.isEqual(JSON.parse(body), clientsBulk).should.be.true;

        done();
      });
    });

  });

  describe('#GET    '.cyan + v1 + '/clients/:id', function() {
    var clientId     = '4fd331ec0f0d9ec903000001',
        fakeClientId = '4fd331yyyy0d9ec9030x0001';

    it("should get client", function(done) {
      var expectedClient;

      expectedClient = _.find(clientsBulk, function(doc) {
        return doc._id === clientId;
      });

      request(appUrl + '/clients/' + clientId, function(err, res, body) {
        if (err) { throw err; }

        res.statusCode.should.equal(200);
        should.exist(res.headers.etag);
        _.isEqual(JSON.parse(body), expectedClient).should.be.true;

        done();
      })
    });

    it("should return 404 when client doesn't exist", function(done) {
      request(appUrl + '/clients/' + fakeClientId, function(err, res, body) {
        if (err) { throw err; }

        should.not.exist(JSON.parse(body));
        res.statusCode.should.equal(404);

        done();
      })
    });

  });

  describe('#POST   '.cyan + v1 + '/clients', function() {
    var newClient = {
      name: 'Andrew Jenkins',
      email: 'andy_jenks@gmail.fu',
      born: '1987-07-07T10:32:51.190Z',
      company: 'Andrew & associates'
    };

    it("should create client and return 201 Created && Location header", function(done) {
      async.waterfall([
        function createResource(callback) {
          request({
            method : "POST",
            url    : appUrl + '/clients',
            form   : newClient
          }, callback);
        },
        function checkResponse(res, body, callback) {
          var jsonBody;

          jsonBody = JSON.parse(body);
          delete jsonBody._id;
          delete jsonBody.photo;

          res.statusCode.should.equal(201);
          should.exist(res.headers['location']);
          _.isEqual(newClient, jsonBody).should.be.true;

          callback(null, res.headers['location']);
        },
        function getCreated(loc, callback) {
          request(loc, callback);
        }
      ], function checkCreated(err, res, body) {
        var client;

        if (err) { throw err; }
        client = JSON.parse(body);

        res.statusCode.should.equal(200);
        client = _.pick(client, 'name', 'email', 'born', 'company');
        _.isEqual(client, newClient).should.be.true;

        done();
      });
    });

    it("should return error for invalid name", function(done) {
      newClient.email = "example1@example.com";
      newClient.name  = "A";

      request({
        method : "POST",
        url    : appUrl + '/clients',
        form   : newClient
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.name, config.error_messages.NAME);

        done();
      });
    });

    it("should return error for existing email", function(done) {
      // using an existing email
      newClient.email = "andy_jenks@gmail.fu";
      newClient.name  = "And Jenks";

      request({
        method : "POST",
        url    : appUrl + '/clients',
        form   : newClient
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.email, config.error_messages.DUPLICATE);

        done();
      });

    });

    it("should return error for invalid email", function(done) {
      newClient.email = 'example@example';

      request({
        method : "POST",
        url    : appUrl + '/clients',
        form   : newClient
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.email, config.error_messages.EMAIL);

        done();
      });
    });

    it("should return error for invalid company", function(done) {
      newClient.name    = "Abc Def";
      newClient.company = "abc";
      newClient.email   = 'example2@example.co';

      request({
        method : "POST",
        url    : appUrl + '/clients',
        form   : newClient
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.company, config.error_messages.COMPANY);

        done();
      });
    });

    it("should return error for invalid birth date", function(done) {
      newClient.name    = "Alpha Bet";
      newClient.company = "McMc Lean";
      newClient.email   = "example2838@example.com";
      newClient.born    = "abc";

      request({
        method : "POST",
        url    : appUrl + '/clients',
        form   : newClient
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.born, config.error_messages.BORN);

        done();
      });
    });

    it("should return error if birth date occured less than 18 years ago", function(done) {
      newClient.name    = "Alpha Bet";
      newClient.company = "McMc Lean";
      newClient.email   = "example28929292938@example.com";
      newClient.born    = new Date();

      request({
        method : "POST",
        url    : appUrl + '/clients',
        form   : newClient
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.born, config.error_messages.BORN);

        done();
      });
    });

  });

  describe('#PUT    '.cyan + v1 + '/clients/:id', function() {
    var existingClient = {
      "name"    : "Friedrich Jerde",
      "email"   : "Deon_Walter@janie.biz",
      "born"    : "1984-06-09T11:41:20.096Z",
      "company" : "Reinger-Kris",
      "_id"     : "4fd331ec0f0d9ec903000001",
      "photo"   : false
    };

    it("should modify client and return 204 No Content", function(done) {
      var client = _.clone(existingClient);

      client.company = "IT Soft Corp Blah";

      async.waterfall([
        function putResource(callback) {
          request({
            method : "PUT",
            url    : appUrl + '/clients/' + client._id,
            form   : client
          }, callback);
        },
        function checkResponse(res, body, callback) {
          res.statusCode.should.equal(204);
          callback();
        },
        function getUpdatedResource(callback) {
          request(appUrl + '/clients/' + client._id, callback);
        }
      ], function checkUpdated(err, res, body) {
        if (err) { throw err; }

        _.isEqual(client, JSON.parse(body)).should.be.true;

        done();
      });
    });

    it("should return 404 when trying to update non-existing client", function(done) {
      var client = _.clone(existingClient);

      client._id     = "4fd3NNNNNN0dQQQ903000001";
      client.company = "IT Soft Corp Blah";

      request({
        method : "PUT",
        url    : appUrl + '/clients/' + client._id,
        form   : client
      }, function(err, res, body) {
        if (err) { throw err; }

        res.statusCode.should.equal(404);

        done();
      });
    });

    it("should return error for invalid name", function(done) {
      var client = _.clone(existingClient);

      client.name  = "A";

      request({
        method : "PUT",
        url    : appUrl + '/clients/' + client._id,
        form   : client
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.name, config.error_messages.NAME);

        done();
      });
    });

    it("should return error for existing email", function(done) {
      var client = _.clone(existingClient);

      // using an existing email
      client.email = "andy_jenks@gmail.fu";

      request({
        method : "PUT",
        url    : appUrl + '/clients/' + client._id,
        form   : client
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.email, config.error_messages.DUPLICATE);

        done();
      });

    });

    it("should return error for invalid email", function(done) {
      var client = _.clone(existingClient);
      client.email = 'example@example';

      request({
        method : "PUT",
        url    : appUrl + '/clients/' + client._id,
        form   : client
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.email, config.error_messages.EMAIL);

        done();
      });
    });

    it("should return error for invalid company", function(done) {
      var client = _.clone(existingClient);
      client.company = 'a';

      request({
        method : "PUT",
        url    : appUrl + '/clients/' + client._id,
        form   : client
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.company, config.error_messages.COMPANY);

        done();
      });
    });

    it("should return error for invalid birth date", function(done) {
      var client = _.clone(existingClient);
      client.born    = "abc";

      request({
        method : "PUT",
        url    : appUrl + '/clients/' + client._id,
        form   : client
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.born, config.error_messages.BORN);

        done();
      });
    });

    it("should return error if birth date occured less than 18 years ago", function(done) {
      var client = _.clone(existingClient);
      client.born    = new Date();

      request({
        method : "PUT",
        url    : appUrl + '/clients/' + client._id,
        form   : client
      }, function(err, res, body) {
        if (err) { throw err; }

        body = JSON.parse(body);
        res.statusCode.should.equal(200);
        should.equal(body.errors.born, config.error_messages.BORN);

        done();
      });
    });

  });

  describe('#DELETE '.cyan + v1 + '/clients/:id', function() {
    var clientId = '4fd331ec0f0d9ec903000001';

    it("should delete client and return 200 OK", function(done) {

      async.series([
        function checkClient(callback) {
          Client.findById(clientId, function(err, client) {
            if (err) { throw err; }
            if (!client) { throw new Error("Client doesn't exist"); }

            callback();
          })
        },
        function deleteClient(callback) {
          request.del(appUrl + '/clients/' + clientId, function(err, res, body) {
            if (err) { throw err; }

            res.statusCode.should.equal(200);
            callback();
          })
        },
        function checkDeletion() {
          request(appUrl + '/clients/' + clientId, function(err, res, body) {
            if (err) { throw err; }

            should.not.exist(JSON.parse(body));
            res.statusCode.should.equal(404);

            done();
          })
        }
      ]);

    });

    it("should return 404 if client doesn't exist", function(done) {
      var clientId = '4fd331ec0f0d9ec903000001';

      request.del(appUrl + '/clients/' + clientId, function(err, res, body) {
        if (err) { throw err; }

        res.statusCode.should.equal(404);
        done();
      })
    });

  });

});
