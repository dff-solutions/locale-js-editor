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


  Views.EditKeyValueItem = Backbone.View.extend({
    template: 'app/templates/localeedit/editKeyValueItem',
    manage: true,

    tagName: "li",
    className: 'edititem ',

    events: {
      "change input.translation":  "translationChanged"
    },
    
    translationChanged: function(ev) {
      console.log(ev);
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
      "keyup #keySearchTask" : "search"
      //,
      //"change #taskSorting":"sorts"
    },
    search: function(e){
      var letters = $("#keySearchTask").val();
      this.renderList(this.collection.search(letters));
    },  

    renderList : function(task){
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

      this.collection.on("fetch", function() {
        this.$("div.loading").html("<img src='/app/img/loading.gif'>");
      }, this);
      //this.collection.fetch();
    }    

  });  

   return Views;

});