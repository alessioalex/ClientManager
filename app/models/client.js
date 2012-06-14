module.exports = function(mongoose) {
  var validator = require('../../lib/validator'),
      Schema    = mongoose.Schema,
      Client;

  Client = new Schema({
    name  :  {
      type     : String,
      validate : [validator({
        length: {
          min : 2,
          max : 100
        }
      }), "name"],
      required : true
    },
    email : {
      type     : String,
      validate : [validator({
        isEmail : true,
        length  : {
          min : 7,
          max : 100
        }
      }), "email"],
      unique   : true,
      required : true
    },
    born  :  {
      type : Date,
      validate : [validator({
        minAge : 18
      }), "born"],
      required : true
    },
    company : {
      type     : String,
      validate : [validator({
        length: {
          min : 5,
          max : 100
        }
      }), "company"],
      required : true
    },
    photo: {
      type    : Boolean,
      default : false
    }
  });

  // similar to SQL's like
  function like(query, field, val) {
    return (field) ? query.regex(field, new RegExp(val, 'i')) : query;
  }

  Client.statics.search = function search(params, callback) {
    var Model = mongoose.model('Client'),
        query = Model.find();


    like(query, 'name', params.name);
    like(query, 'email', params.email);
    like(query, 'company', params.company);

    query.exec(callback);
  };

  Client.statics.findById = function findById(id, callback) {
    var Model = mongoose.model('Client'),
        query = Model.find();

    if (id.length !== 24) {
      callback(null, null);
    } else {
      Model.findOne().where('_id', id).exec(callback);
    }
  };

  return mongoose.model('Client', Client);
}
