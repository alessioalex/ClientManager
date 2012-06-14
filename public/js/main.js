requirejs.config({
  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'bootstrap': {
      deps: ['jquery'],
      exports: 'bootstrap'
    }
  },
  // remove paths when optimizing {
  paths: {
    'text'       : 'lib/text',
    'jquery'     : [
        'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
        // If the CDN location fails, load from this location
        'lib/jquery.min'
    ],
    'underscore'       : 'lib/underscore.min',
    'backbone'         : 'lib/backbone.min',
    'bootstrap'        : 'lib/bootstrap.min',
    'moment'           : 'lib/moment.min',
    'Mediator'         : 'lib/mediator',
    'App'              : 'app',
    'Router'           : 'router',
    'ClientModel'      : 'models/client',
    'ClientCollection' : 'collections/clients',
    'HomeView'         : 'views/home',
    'HeaderView'       : 'views/header',
    'ClientListView'   : 'views/clients/index',
    'ClientEditView'   : 'views/clients/edit',
    'ClientView'       : 'views/clients/show'
  }
  // } end remove paths
});

require(['App'], function(App, Client) {
  App.initialize();
});
