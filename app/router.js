//
define([
  // Application.
  "app",
  "modules/localeEdit/localeEdit",
  "jquery"
],

function(app,LocaleEdit,jquery) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "index": "index",      
      "edit": "edit",            
      "overview": "overview"
    },
    overview: function() {
            jquery('#loadIndicator').show();
            app.useLayout('main').setViews({

                    '#stage': new LocaleEdit.Views.Overview()
             }).render()
              .done(function() {
                  jquery.when(LocaleEdit.InitFileListUi())
                        .done(function(){

                        jquery('ul.nav li').removeClass('active');
                        jquery('ul.nav a[href="#overview"]').parent().addClass('active');                  
                        jquery('#loadIndicator').fadeOut('slow');
                      });
              });  
    },
    index: function() {
            jquery('#loadIndicator').show();
            app.useLayout('main').setViews({
                    '#stage': new LocaleEdit.Views.Upload()
             }).render()
            .done(function(){
              jquery.when(LocaleEdit.InitUi())
                    .done(function(){
                        jquery('ul.nav li').removeClass('active');
                        jquery('ul.nav a[href="#index"]').parent().addClass('active');              
                        jquery('#loadIndicator').fadeOut('slow');
                    });
            });
    },
    edit: function() {
            jquery('#loadIndicator').show();
            var collection = new LocaleEdit.Collection();
            app.useLayout('edit').setViews({
                  "#filter-wrapper": new LocaleEdit.Views.EditFilter(),
                  "#editItems-wrapper": new LocaleEdit.Views.EditList({
                                        collection: collection
                                      })
             }).render()
            .done(function(){
                        jquery('ul.nav li').removeClass('active');
                        jquery('ul.nav a[href="#edit"]').parent().addClass('active');   
            }).done(function(){
                        collection.fetch();  
            });     
    }    
  });


  return Router;

});
