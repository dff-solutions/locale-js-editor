define([
  // Application.
  "app",
  "modules/localeEdit"
],

function(app,LocaleEdit) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index"
    },

    help: function() {
      // Create a layout and associate it with the #main div.
      var layout = new Backbone.Layout({
        el: "#main"
      });

      // Insert the tutorial into the layout.
      layout.insertView(new LocaleEdit.Views.Layout());

    },

    index: function() {
      // Create a layout and associate it with the #main div.
      var layout = new Backbone.Layout({
        el: "#main"
      });

      // Insert the tutorial into the layout.
      layout.insertView(new LocaleEdit.Views.Layout());
      
      // Render the layout into the DOM.


      layout
        .render()
        .done(function(){
          
                $('#fileupload').fileupload({
                        dataType: 'json',
                        add: function (e, data) {
                                $(this).fileupload('process', data).done(function () {
                                    data.submit();
                                });
                            },
                        maxFileSize: 5000000,
                                    acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                                    process: [
                                        {
                                            action: 'load',
                                            fileTypes: /^image\/(gif|jpeg|png)$/,
                                            maxFileSize: 20000000 // 20MB
                                        },
                                        {
                                            action: 'resize',
                                            maxWidth: 1440,
                                            maxHeight: 900
                                        },
                                        {
                                            action: 'save'
                                        }
                                    ],
                        progressall: function (e, data) {
                                var progress = parseInt(data.loaded / data.total * 100, 10);
                                $('#progress .bar').css(
                                    'width',
                                    progress + '%'
                                );
                            },
                        done: function (e, data) {
                            /*$.each(data.result, function (index, file) {
                                $('<p/>').text(file.name).appendTo(document.body);
                            });*/

                        console.log('done')
                        }
                    });
        });
    }
  });

  return Router;

});
