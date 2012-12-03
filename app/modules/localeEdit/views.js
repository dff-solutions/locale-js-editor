define([
  'app',
  'LocaleEdit',
  'backbone'
],

function(app, LocaleEdit, Backbone) {

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

    dataSearchTerms : {
        keySearchterm :'FooSearch'
    },
    data: function() {
      return {
        count: this.collection.length,
        keySearchterm:   this.dataSearchTerms.keySearchterm
      };
    },

    events: {
      "keyup #keySearchTask" : "search",
      "click #SaveBtn" : "save"
      //,
      //"change #taskSorting":"sorts"
    },
    search: function(e){
      this.dataSearchTerms.keySearchterm = $("#keySearchTask").val();
      var collToUse = this.wholeCollecxtion || this.collection;
      this.renderList(collToUse.search(this.dataSearchTerms.keySearchterm));
      // this.collection.filter(function(model) {
      //   return model.get("LocaleKey").indexOf(searchTerm) != -1;
      // });
      // this.collection.reset();
    },  
    save: function() {          
        //localStorage.setItem(this.name, JSON.stringify(this.data)); 
        LocaleEdit.SaveLocales(this.collection);
    },
    renderList : function(task){
     if(this.wholeCollecxtion === undefined)
     {
        this.wholeCollecxtion =  this.collection;
     };
     this.collection = task;
     this.render();
      console.log(task);
    },    

    beforeRender: function() {
      //var active = this.options.commits.repo;

      this.collection.each(function(locale) {
        // if (locale.get("name") === active) {
        //   app.active = repo;
        // }

        this.insertView("div.localelistitems", new Views.EditItem({
          model: locale
        }));
      }, this);
    },

    cleanup: function() {
      this.collection.off(null, null, this);
    },

    initialize: function() {
      this.collection.on("reset", this.render, this);
      this.searchterm ="";
      this.collection.on("fetch", function() {
        this.$("div.loading").html("<img src='/app/img/loading.gif'>");
      }, this);
      //this.collection.fetch();
    }    

  });  

   return Views;

});