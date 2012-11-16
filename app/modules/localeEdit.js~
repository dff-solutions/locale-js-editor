// Localeedit module
define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Localeedit = app.module();

  // Default Model.
  Localeedit.Model = Backbone.Model.extend({
  
  });

  // Default Collection.
  Localeedit.Collection = Backbone.Collection.extend({
    model: Localeedit.Model
  });

  // Default View.
  Localeedit.Views.Layout = Backbone.Layout.extend({
    template: "localeedit"
  });

  // Return the module for AMD compliance.
  return Localeedit;

});
