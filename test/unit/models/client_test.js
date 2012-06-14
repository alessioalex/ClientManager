process.env.NODE_ENV = 'test';

var mongoose = require('mongoose'),
    root     = __dirname + '/../../../',
    utils    = require(root + 'lib/utils'),
    should   = require('should'),
    moment   = require('moment'),
    _        = require('underscore'),
    cleanDb  = utils.cleanDb,
    ENV, clientsBulk;

ENV = process.env.NODE_ENV;

describe('Models::Client', function() {
  var config, Client;

  before(function(done) {
    utils.loadConfig(root + 'config', function(conf) {
      config = conf;
      mongoose = utils.connectToDatabase(mongoose, config.db[ENV].main, function (err) {
        if (err) { throw err; }

        Client = require(root + 'app/models/client')(mongoose);
        done();
      });
    });
  });

  after(function(done) {
    cleanDb(Client, function() {
      mongoose.disconnect();
      setTimeout(done, 1000);
    });
  });

  describe('#New client', function() {

    beforeEach(function(done) {
      cleanDb(Client, function() {
        setTimeout(done, 200);
      });
    });

    it('should not have a photo by default', function() {
      var newClient = new Client();

      newClient.photo.should.be.false;
    });

    it('should have the fields name, email, company, born required', function() {
      var newClient = new Client();

      newClient.save(function(err) {
        err.errors.should.have.property('name');
        err.errors.should.have.property('email');
        err.errors.should.have.property('company');
        err.errors.should.have.property('born');
      });
    });

    // 2 <= name.length <= 100
    it('should have a valid name', function(done) {
      var newClient     = new Client(),
          anotherClient = new Client(),
          lastClient    = new Client(),
          left          = 3,
          temp          = '',
          i;

      newClient.name    = "A";
      newClient.email   = "example@example.com";
      newClient.company = "Peach Corp";
      newClient.born    = moment().year(1987).toDate();

      newClient.save(function(err) {
        err.errors.should.have.property('name');
        if (!--left) { done(); }
      });

      for (i = 1; i <= 101; i++) {
        temp += 'a';
      }

      anotherClient.name = temp;
      anotherClient.email   = "example2@example.com";
      anotherClient.company = "Peach Corp2";
      anotherClient.born    = moment().year(1980).toDate();

      anotherClient.save(function(err) {
        err.errors.should.have.property('name');
        if (!--left) { done(); }
      });

      lastClient.name    = "Andrew";
      lastClient.email   = "example3asdasd@example.com";
      lastClient.company = "IT Corp";
      lastClient.born    = moment().year(1987).toDate();

      lastClient.save(function(err) {
        should.not.exist(err);
        if (!--left) { done(); }
      });
    });

    it('should have a valid email', function(done) {
      var newClient     = new Client(),
          anotherClient = new Client(),
          lastClient    = new Client(),
          left          = 3;

      newClient.name    = "Andrew";
      newClient.email   = "examp$le@example.com";
      newClient.company = "Peach Corp";
      newClient.born    = moment().year(1987).toDate();

      newClient.save(function(err) {
        err.errors.should.have.property('email');
        if (!--left) { done(); }
      });

      anotherClient.name = "John";
      anotherClient.email   = "example2@example";
      anotherClient.company = "Peach Corp2";
      anotherClient.born    = moment().year(1980).toDate();

      anotherClient.save(function(err) {
        err.errors.should.have.property('email');
        if (!--left) { done(); }
      });

      lastClient.name    = "Andrew";
      lastClient.email   = "john.doe@yahoo.co.uk";
      lastClient.company = "IT Corp";
      lastClient.born    = moment().year(1987).toDate();

      lastClient.save(function(err) {
        should.not.exist(err);
        if (!--left) { done(); }
      });
    });

    it('should have a valid birth date', function(done) {
      var newClient     = new Client(),
          anotherClient = new Client(),
          lastClient = new Client(),
          left          = 3;

      newClient.name    = "Andrew";
      newClient.email   = "andrew.doe@example.com";
      newClient.company = "Peach Corp";
      newClient.born    = "abc";

      newClient.save(function(err) {
        err.name.should.equal('CastError');
        if (!--left) { done(); }
      });

      anotherClient.name = "John";
      anotherClient.email   = "example@example.com";
      anotherClient.company = "Peach Corp2";
      anotherClient.born    = moment().subtract('years', 17).toDate();

      anotherClient.save(function(err) {
        err.errors.should.have.property('born');
        if (!--left) { done(); }
      });

      lastClient.name    = "Andrew";
      lastClient.email   = "john.doe@yahoo.co.uk";
      lastClient.company = "IT Corp";
      lastClient.born    = moment().year(1987).toDate();

      lastClient.save(function(err) {
        should.not.exist(err);
        if (!--left) { done(); }
      });
    });
  });

  describe('#Static methods', function() {

    before(function(done) {
      cleanDb(Client, function() {
        utils.loadFixtures(function(err, clients) {
          if (err) { throw err; }

          clientsBulk = clients;
          utils.bulkInsert(Client, clients, done);
        });
      });
    });

    it('should search client by name', function(done) {
      var searchTerm = 'Fiona';

      Client.search({ name: searchTerm }, function(err, docs) {
        var bulkLen = clientsBulk.length, expectedClients;

        expectedClients = _.filter(clientsBulk, function(doc) {
          return doc.name.indexOf(searchTerm) !== -1;
        });

        // "sanitize" docs just in case, since Mongoose has strange getters and setters
        docs = JSON.parse(JSON.stringify(docs));
        docs.length.should.equal(2);
        _.isEqual(docs, expectedClients).should.be.true;

        done();
      });
    });

    it('should search client by email', function(done) {
      var searchTerm = 'Sandrine@candice.us';

      Client.search({ email: searchTerm }, function(err, docs) {
        var bulkLen = clientsBulk.length, expectedClient;

        expectedClient = _.find(clientsBulk, function(doc) {
          return doc.email.indexOf(searchTerm) !== -1;
        });

        docs = JSON.parse(JSON.stringify(docs));
        docs.length.should.equal(1);
        _.isEqual(docs[0], expectedClient).should.be.true;

        done();
      });
    });

    it('should search client by company', function(done) {
      var searchTerm = 'Emmerich, Schuppe';

      Client.search({ company: searchTerm }, function(err, docs) {
        var bulkLen = clientsBulk.length, expectedClients;

        expectedClients = _.filter(clientsBulk, function(doc) {
          return doc.company.indexOf(searchTerm) !== -1;
        });

        docs = JSON.parse(JSON.stringify(docs));
        docs.length.should.equal(2);
        _.isEqual(docs, expectedClients).should.be.true;

        done();
      });
    });

  });

});
