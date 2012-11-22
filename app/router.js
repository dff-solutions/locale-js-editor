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
      "upload": "index",      
      "overview": "overview"
    },

    overview: function() {
         var collection = new LocaleEdit.Collection();
            app.useLayout('main').setViews({
                    // Attach the bar View into the content View
                    '#main': new LocaleEdit.Views.Overview({
                    })
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

        var collection = new LocaleEdit.Collection();
            app.useLayout('main').setViews({
                    // Attach the bar View into the content View
                    '#main': new LocaleEdit.Views.Upload({
                            collection: collection
                    })
             }).render()
            .done(function(){
              jquery.when(LocaleEdit.InitUi())
                    .done(function(){
                        jquery('ul.nav li').removeClass('active');
                        jquery('ul.nav a[href="#upload"]').parent().addClass('active');              
                    });
              

            });


    }
  });


  return Router;

});
