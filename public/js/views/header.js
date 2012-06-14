define('HeaderView', [
  'jquery',
  'underscore',
  'backbone',
  'text!templates/header.html'
], function($, _, Backbone, tpl) {
  var HeaderView;

  HeaderView = Backbone.View.extend({
    initialize: function() {
      var ajaxLoader;

      this.template = _.template(tpl);

      $('body').ajaxStart(function() {
        ajaxLoader = ajaxLoader || $('.ajax-loader');
        ajaxLoader.show();
      }).ajaxStop(function() {
        ajaxLoader.fadeOut('fast');
      });
    },
    render: function() {
      $(this.el).html(this.template());
      return this;
    },
    select: function(item) {
      $('.nav li').removeClass('active');
      $('.' + item).addClass('active');
    }
  });

  return HeaderView;
});
