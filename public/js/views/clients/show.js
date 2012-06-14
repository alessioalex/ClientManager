define('ClientView', [
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'text!templates/clients/show.html',
  'ClientModel'
], function($, _, Backbone, moment, tpl, Client) {
  var ClientView;

  ClientView = Backbone.View.extend({
    initialize: function() {
      this.template = _.template(tpl);
    },
    events: {
      "click .delete-btn": "removeClient"
    },
    render: function() {
      var that = this, tmpl;

      tmpl = that.template({ client: this.model.toJSON() });
      $(that.el).html(tmpl);

      return this;
    },
    removeClient: function(e) {
      e.preventDefault();

      this.model.destroy({
        sync: true,
        success: function(model) {
          model.trigger('delete-success');
        },
        error: function(model, res) {
          if (res.status === 404) {
            // TODO: handle 404 Not Found
          } else if (res.status === 500) {
            // TODO: handle 500 Internal Server Error
          }
        }
      })
    }
  });

  return ClientView;
});
