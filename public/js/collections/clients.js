define('ClientCollection', [
  'jquery',
  'underscore',
  'backbone',
  'ClientModel'
], function($, _, Backbone, Client) {
  var ClientCollection;

  ClientCollection = Backbone.Collection.extend({
    model : Client,
    url   : "api/v1/clients"
  });

  return ClientCollection;
});
