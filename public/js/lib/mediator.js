define('Mediator', ['underscore', 'backbone'], function(_, Backbone) {
  var Mediator = {};

  _.extend(Mediator, Backbone.Events);
  Mediator.emit = Mediator.trigger;

  return Mediator;
});
