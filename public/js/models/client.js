define('ClientModel', [
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  var Client;

  Client = Backbone.Model.extend({
    idAttribute: "_id",
    urlRoot: "/api/v1/clients",
    // set defaults for checking existance in the template for the new model
    defaults: {
      name    : '',
      email   : '',
      company : '',
      born    : new Date()
    },
    validate: function(attrs) {
      var fields, i, len, nameLen, compLen, errors = {};

      /**
       * HACK: don't validate when silent is passed as an attribute
       * Useful when fetching model from server only by id
       */
      if (!attrs._silent) {
        // check required fields
        fields = ['name', 'email', 'company', 'born'];
        for (i = 0, len = fields.length; i < len; i++) {
          if (!attrs[fields[i]]) {
            errors[fields[i]] = fields[i] + ' required';
          }
        }

        // check valid name
        nameLen = (attrs.name) ? attrs.name.length : null;
        if (nameLen < 2 || nameLen > 100) {
          errors.name = "invalid name";
        }

        // check valid company
        compLen = (attrs.company) ? attrs.company.length : null;
        if (!compLen || (compLen < 7 || compLen > 100)) {
          errors.company = "invalid company";
        }

        // check valid email
        if (!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(attrs.email))) {
          errors.email = "invalid email";
        }

        if (_.keys(errors).length) {
          return {
            errors: errors
          };
        }
      }

    }
  });

  return Client;
});
