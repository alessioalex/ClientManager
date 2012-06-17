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
  /**
   * HACK:
   * Modified Underscore and Backbone to be AMD compatible (define themselves)
   * since it didn't work properly with the RequireJS shim when optimizing
   */
  paths: {
    'text'             : 'lib/text',
    'jquery'           : 'lib/jquery',
    'underscore'       : 'lib/underscore-amd',
    'backbone'         : 'lib/backbone-amd',
    'bootstrap'        : 'lib/bootstrap',
    'moment'           : 'lib/moment',
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
});

require(['App'], function(App, Client) {
  App.initialize();
});
