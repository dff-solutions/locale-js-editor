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
      click: "activateInput"
    },
    
    activateInput: function(ev) {
      var model = this.model;
      //this.$el.find('input').removeAttr('disable');
      model.Active = true;
      // var org = app.router.users.org;
      // var user = app.router.repos.user;

      // // Immediately reflect the active state.
      // app.active = this.model;
      this.render();

      // // Easily create a URL.
      // app.router.go("org", org, "user", user, "repo", model.get("name"));

      return false;
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

    events: {
      click: "activateInput"
    },
    
    activateInput: function(ev) {
      var model = this.model;


      return false;
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
   
    data: function() {
      return {
        count: this.collection.length 
      };
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
        this.$("ul").parent().html("<img src='/app/img/loading.gif'>");
      }, this);
      this.collection.fetch();
    }    

  });  

   return Views;

});