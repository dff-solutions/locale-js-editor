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

Views.Edit = Backbone.View.extend({
    template: 'app/templates/localeedit/edit',
    tagName: 'div',
    manage: true,
/*    render: function () {
        var tmpl = _.template(this.template);
        this.$el.html(tmpl(this.model.toJSON()));
        return this;
    } */
   });  

   return Views;

});