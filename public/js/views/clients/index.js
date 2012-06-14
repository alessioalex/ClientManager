define('ClientListView', [
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'text!templates/clients/index.html',
  'ClientCollection'
], function($, _, Backbone, moment, tpl, ClientCollection) {
  var ClientListView;

  ClientListView = Backbone.View.extend({
    initialize: function() {
      var clientList;

      this.template = _.template(tpl);
      this.collection = new ClientCollection();
    },
    getData: function(callback) {
      this.collection.fetch({
        success: function(collection) {
          callback(collection);
        },
        error: function(coll, res) {
          if (res.status === 404) {
            // TODO: handle 404 Not Found
          } else if (res.status === 500) {
            // TODO: handle 500 Internal Server Error
          }
        }
      });
    },
    // render template after data refresh
    render: function(callback) {
      var that = this, tmpl;

      this.getData(function(collection) {
        tmpl = that.template({ clients: collection.toJSON() });
        $(that.el).html(tmpl);

        callback();
      });
    }
  });

  return ClientListView;
});
