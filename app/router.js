//
define([
  // Application.
  "app",
  "modules/localeEdit",
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
            app.useLayout('main').setViews({

                    '#main': new LocaleEdit.Views.Overview()
             }).render()
              .done(function() {
                  jquery.when(LocaleEdit.InitFileListUi())
                        .done(function(){

                          jquery('ul.nav li').removeClass('active');
                        jquery('ul.nav a[href="#overview"]').parent().addClass('active');                  
                      });
              });  


    },

    index: function() {

            app.useLayout('main').setViews({

                    '#main': new LocaleEdit.Views.Upload()
             }).render()
            .done(function(){
              jquery.when(LocaleEdit.InitUi())
                    .done(function(){
                        jquery('ul.nav li').removeClass('active');
                        jquery('ul.nav a[href="#index"]').parent().addClass('active');              
                    });
              

            });


    },
    edit: function() {

            var collection = new LocaleEdit.Collection();
            app.useLayout('main').setViews({
                    // Attach the bar View into the content View
                    '#main': new LocaleEdit.Views.EditList({
                            collection: collection
                    })
             }).render()
            .done(function(){
                        jquery('ul.nav li').removeClass('active');
                        jquery('ul.nav a[href="#edit"]').parent().addClass('active');   
                        
            });           

    }    


  });


  return Router;

});
