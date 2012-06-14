var v1       = '/api/v1',
    utils    = require('../../lib/utils'),
    _        = require('underscore'),
    NotFound = utils.NotFound,
    checkErr = utils.checkErr,
    log      = console.log,
    ClientsController;

ClientsController = function(app, mongoose, config) {

  var Client = mongoose.model('Client');

  app.get(v1 + '/clients', function index(req, res, next) {
    Client.search(req.query, function(err, clients) {
      checkErr(
        next,
        [{ cond: err }],
        function() {
          // TODO: finish etag support here, check for If-None-Match
          res.header('ETag', utils.etag(clients));
          res.json(clients);
        }
      );
    });
  });

  app.get(v1 + '/clients/:id', function show(req, res, next) {
    Client.findById(req.params.id, function(err, client) {
      checkErr(
        next,
        [{ cond: err }, { cond: !client, err: new NotFound('json') }],
        function() {
          // TODO: finish etag support here, check for If-None-Match
          res.header('ETag', utils.etag(client));
          res.json(client);
        }
      );
    });
  });

  app.post(v1 + '/clients', function create(req, res, next) {
    var newClient;

    // disallow other fields besides those listed below
    newClient = new Client(_.pick(req.body, 'name', 'email', 'born', 'company'));
    newClient.save(function(err) {
      var errors, code = 200, loc;

      if (!err) {
        loc = config.site_url + v1 + '/clients/' + newClient._id;
        res.setHeader('Location', loc);
        res.json(newClient, 201);
      } else {
        errors = utils.parseDbErrors(err, config.error_messages);
        if (errors.code) {
          code = errors.code;
          delete errors.code;
          // TODO: better better logging system
          log(err);
        }
        res.json(errors, code);
      }
    });
  });

  app.put(v1 + '/clients/:id', function update(req, res, next) {
    Client.findById(req.params.id, function(err, client) {
      checkErr(
        next,
        [{ cond: err }, { cond: !client, err: new NotFound('json') }],
        function() {
          var newAttributes;

          // modify resource with allowed attributes
          newAttributes = _.pick(req.body, 'name', 'email', 'born', 'company');
          client = _.extend(client, newAttributes);

          client.save(function(err) {
            var errors, code = 200;

            if (!err) {
              // send 204 No Content
              res.send();
            } else {
              errors = utils.parseDbErrors(err, config.error_messages);
              if (errors.code) {
                code = errors.code;
                delete errors.code;
                log(err);
              }
              res.json(errors, code);
            }
          });
        }
      );
    });
  });

  app.del(v1 + '/clients/:id', function destroy(req, res, next) {
    Client.findById(req.params.id, function(err, client) {
      checkErr(
        next,
        [{ cond: err }, { cond: !client, err: new NotFound('json') }],
        function() {
          client.remove();
          res.json({});
        }
      );
    });
  });

};

module.exports = ClientsController;
