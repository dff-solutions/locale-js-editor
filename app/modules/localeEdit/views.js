define([
  'app',

  // Libs
  'backbone'
],

function(app, Backbone) {

  var Views = {};

  Views.Upload = Backbone.View.extend({
    template: 'app/templates/localeedit/upload',
    tagName: 'div',
    manage: true

   });

  Views.Overview = Backbone.View.extend({
    template: 'app/templates/localeedit/overview',
    tagName: 'div',
    manage: true
   });

   return Views;

});