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
    manage: true
   });

  Views.EditItem = Backbone.View.extend({
    template: 'app/templates/localeedit/editItem',
    manage: true
   });

Views.Edit = Backbone.View.extend({
    template: 'app/templates/localeedit/edit',
    tagName: 'div',
    manage: true,
    initialize: function() {

      _.bindAll(this, 'render');
      this.collection.bind("reset", this.render, this);  // reset is called on fetch of collection
      this.collection.fetch();

    },
    // Insert all subViews prior to rendering the View.
  beforeRender: function() {
    // Iterate over the passed collection and create a view for each item.
    this.collection.each(function(model) {
      // Pass the sample data to the new SomeItem View.
      this.insertView(new Views.EditItem({
        serialize:  model.toJSON() 
      }));
    }, this);
  }
  // ,
  //   render : function() {
  //     this._render();
  //     // var     tmpl =  _.template( $('.edit').html() );
  //     // console.log(this.collection);
      
  //     $.each(this.collection.models, function(index, value){
  //       var obj = value.toJSON();

  //       console.log(obj);
  //     })

  //     //$mainthis.$el.html( this.tmpl( this.collection.toJSON() ) );
  //   }
  });  

   return Views;

});