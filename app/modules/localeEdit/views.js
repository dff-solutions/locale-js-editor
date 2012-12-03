define([
  'app',
  'LocaleEdit',
  'backbone',
  'Mediator'
],

function(app, LocaleEdit,  Backbone) {

  var Views = {};
  var mediator = new Mediator();

  Views.Upload = Backbone.View.extend({
    template: 'app/templates/localeedit/upload',
    tagName: 'div',
    manage: true
   });

  Views.Overview = Backbone.View.extend({
    template: 'app/templates/localeedit/overview',
    manage: true
   });

  Views.EditFilter = Backbone.View.extend({
        events: {
      "keyup #keySearchTask" : "KeySearch",
    },
    KeySearch: function(e){
      var keySearchterm = $("#keySearchTask").val();
      mediator.Publish('keySearch', keySearchterm);
        return this;
    },    
    template: 'app/templates/localeedit/filter',
    manage: true
   });

  Views.EditKeyValueItem = Backbone.View.extend({
    template: 'app/templates/localeedit/editKeyValueItem',
    manage: true,

    tagName: "li",
    className: 'edititem ',

    events: {
      "change input.translation":  "translationChanged"
    },
    
    translationChanged: function(ev) {
      this.model.Value = $(ev.target).val();
      this.render();
    },    


    data: function() {
      return { model: this.model };
    }

   });


  Views.EditItem = Backbone.View.extend({
    template: 'app/templates/localeedit/editItem',
    manage: true,

    tagName: "div",
    className: 'edit-wrapper-outer',

    data: function() {
      return { model: this.model };
    },


    beforeRender: function() {
      var items = this.model.get('LocaleValues');

      for (var i = 0; i < items.length; i++) {
        this.insertView("ul.locales", new Views.EditKeyValueItem({
          model: items[i]
        }));
      }

    }

   });

Views.EditList = Backbone.View.extend({
    template: 'app/templates/localeedit/edit',
    //tagName: 'div',
    manage: true,
       className: 'container',

    data: function() {
      return {
        count: this.collection.length
      };
    },

    events: {
      "click #SaveBtn" : "save"
      //,
      //"change #taskSorting":"sorts"
    },
    search: function(term){
      var collToUse = this.wholeCollecxtion || this.collection;
      this.renderList(collToUse.search(term));


    },  
    save: function() {          
        //localStorage.setItem(this.name, JSON.stringify(this.data)); 
        LocaleEdit.SaveLocales(this.collection);
    },
    renderList : function(filteredCollection){

     if(this.wholeCollecxtion === undefined)
     {
        this.wholeCollecxtion =  this.collection;
     };
     this.collection = filteredCollection;
     this.render();
    },    

    beforeRender: function() {

      var max = 100;
      var count = 0;
      this.collection.each(function(locale) {
        count++;
        //if(count < max) {
          this.insertView("div.localelistitems", new Views.EditItem({
            model: locale
          }));
        //}
      }, this);
    },

    cleanup: function() {
      //this.collection.off(null, null, this);
    },

    initialize: function() {
      this.collection.on("reset", this.render, this);

      mediator.Subscribe('keySearch', this.search, {}, this)

    }    

  });  

   return Views;

});


