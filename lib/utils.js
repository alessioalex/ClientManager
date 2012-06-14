var async  = require('async'),
    fs     = require('fs'),
    ENV    = process.env.NODE_ENV || 'development',
    _      = require('underscore'),
    moment = require('moment'),
    crypto = require('crypto'),
    utils;

utils = {
  loadJson: function(filePath, callback) {
    fs.readFile(filePath, 'UTF-8', function(err, data) {
      var tempData = null, tempErr = null;

      if (err) {
        callback(err, null);
      } else {
        try {
          JSON.parse(data);
        }
        catch(err) {
          tempErr = err;
        }

        if (!tempErr) { tempData = JSON.parse(data); }

        callback(tempErr, tempData);
      }
    });
  },
  walkDir: function(dir, callback) {
    var results = [];

    fs.readdir(dir, function(err, list) {
      var pending;

      if (err) { return callback(err); }
      pending = list.length;
      if (!pending) { return callback(null, results); }

      list.forEach(function(file) {
        file = dir + '/' + file;
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            utils.walkDir(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) { callback(null, results); }
            });
          } else {
            results.push(file);
            if (!--pending) { callback(null, results); }
          }
        });
      });

    });
  },
  /*
   * Recursively search the directory for all JSON files, parse them
   * and trigger a callback with the contents
   */
  loadConfig: function(directory, callback) {
    utils.walkDir(directory, function(err, files) {
      var pending = files.length,
          configs = {},
          ENV     = process.env.NODE_ENV || 'development';

      files.forEach(function(filePath) {
        utils.loadJson(filePath, function(err, data) {
          var filename;

          if (err) { throw err; }
          filename = filePath.split('/').pop().replace('.json', '');
          configs[filename] = data;

          if (!--pending) {
            configs.site_url  = (configs[ENV].HTTPS) ? 'https://' : 'http://';
            configs.site_url += configs[ENV].HOST + ':' + configs[ENV].PORT;

            callback(configs);
          }
        });
      });
    });
  },
  ifEnv: function(env, cb) {
    if (env === ENV) { cb(); }
  },
  connectToDatabase: function(mongoose, config, cb) {
    var dbPath;

    dbPath  = "mongodb://" + config.USER + ":";
    dbPath += config.PASS + "@";
    dbPath += config.HOST + ":";
    dbPath += config.PORT + "/";
    dbPath += config.DATABASE;

    return mongoose.connect(dbPath, cb);
  },
  cleanDb: function(Model, done) {
    Model.find().remove(function(err) {
      if (err) { throw err; }

      done();
    });
  },
  bulkInsert: function(Client, clients, done) {
    async.forEach(clients, function saveClient(client, callback) {
      var newClient = new Client(client);
      newClient.save(callback);
    }, function(err) {
      if (err) { throw err; }
      done();
    });
  },
  loadFixtures: function(callback) {
    utils.loadJson(__dirname + '/../test/fixtures/clients.json', callback);
  },
  parseDbErrors: function(err, errorMessages) {
    var response = {}, errors = {};

    // MongoDB specific errors which are not caught by Mongoose
    if (err.name && err.name === 'MongoError') {
      // duplicate key error
      if (err.code === 11000 || err.code === 11001) {
        return {
          errors: {
            email: errorMessages.DUPLICATE
          }
        };
      } else {
        return {
          code: 500,
          errors: {
            internal: "internal error - data couldn't be saved"
          }
        };
      }
    } else if (err.name === 'ValidationError') {
      Object.keys(err.errors).forEach(function(key) {
        errors[key] = errorMessages[key.toUpperCase()];
      });
      response.errors = errors;

      return response;
    } else if (err.name === 'CastError' && err.type === 'date') {
      errors.born = errorMessages.BORN;
      response.errors = errors;

      return response;
    }

    return err;
  },
  getRandDate: function(from, date, unit) {
    var mom, min, max, timeUnit, timeVal, timeAction;

    min = 1;
    max = 31;

    if (!from) {
      timeAction = _.shuffle(['add', 'subtract'])[0];
      mom = moment();
    } else {
      if (!date) { throw new Error('Please provide a date for getRandDate(from, date)'); }

      mom = moment(date).clone();
      if (from === 'future') {
        // to get a future date you can just add time units
        timeAction = 'add';
      } else if (from === 'past') {
        // to get a past date you can just add time units
        timeAction = 'subtract';
      }
    }

    if (unit && unit.timeUnit && unit.timeVal) {
      timeUnit = unit.timeUnit;
      timeVal  = parseInt(unit.timeVal, 10);
    } else {
      timeUnit = _.shuffle(['months', 'days', 'minutes'])[0];
      timeVal  = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // http://momentjs.com/docs/#/manipulating/add/
    mom = mom[timeAction](timeUnit, timeVal);

    return mom.toDate();
  },
  checkErr: function(next, errArray, callback) {
    var i, len = errArray.length;

    for (i = 0; i < len; i++) {
      if (errArray[i].cond) {
        return next(errArray[i].err || errArray[i].cond);
      }
    }

    callback();
  },
  etag: function(data) {
    var hash;

    if (typeof data === "object") {
      data = JSON.stringify(data);
    }
    hash = crypto.createHash('md5').update(data).digest("hex");

    return hash;
  }
};

function NotFound(msg) {
  this.name = 'NotFound';
  this.msg  = msg;
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}

NotFound.prototype.__proto__ = Error.prototype;

utils.NotFound = NotFound;

module.exports = utils;
