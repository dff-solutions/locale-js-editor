// Localeedit module
define([
  // Application.
  "app",
  "jquery",
  "jquery.ui.widget",   
  "canvas-to-blob",
  "load-image",   
  "tmpl.min",
  "jquery.fileupload",
  "jquery.fileupload-fp",   
  "jquery.fileupload-ui",
  "bootstrap",
  "bootstrap-image-gallery"
],

// Map dependencies from above array.
function(app, jquery ) {

  // Create a new module.
  var Localeedit = app.module();

  // Default Model.
  Localeedit.Model = Backbone.Model.extend({
  
  });

  // Default Collection.
  Localeedit.Collection = Backbone.Collection.extend({
    model: Localeedit.Model
  });

// Default views
  Localeedit.Views = Views;

  // Default View.
  Localeedit.Views.Layout = Backbone.Layout.extend({
    template: "localeedit"
  });

  Localeedit.Views.Overview = Backbone.Layout.extend({
    template: "overview"
  });  

  

  Localeedit.InitUi = function() {

    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        url: 'http://192.168.2.102:8081/upload'
    });

    // Enable iframe cross-domain access via redirect option:
    $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        )
    );


        // Demo settings:
        $('#fileupload').fileupload('option', {
            url: 'http://192.168.2.102:8081/upload',
            maxFileSize: 5000000,
            acceptFileTypes: /(\.|\/)(js)$/i,
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
            ]
        });
        // Upload server status check for browsers with CORS support:
        if ($.support.cors) {
            $.ajax({
                url: 'http://192.168.2.102:8081/upload',
                type: 'HEAD'
            }).fail(function () {
                $('<span class="alert alert-error"/>')
                    .text('Upload server currently unavailable - ' +
                            new Date())
                    .appendTo('#fileupload');
            });
        }



    /*    $('#fileupload').fileupload({
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
                            //$.each(data.result, function (index, file) {
                                //$('<p/>').text(file.name).appendTo(document.body);
                            //});

                        console.log('done')
                        }
                    });*/
  };

 // Initialize the jQuery File Upload widget:
/*    $('#fileupload').fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        url: 'server/php/'
    });

    // Enable iframe cross-domain access via redirect option:
    $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        )
    ); */


        // Upload server status check for browsers with CORS support:
  /*     if ($.support.cors) {
            $.ajax({
                url: '//jquery-file-upload.appspot.com/',
                type: 'HEAD'
            }).fail(function () {
                $('<span class="alert alert-error"/>')
                    .text('Upload server currently unavailable - ' +
                            new Date())
                    .appendTo('#fileupload');
            });
        }
*/

  // Return the module for AMD compliance.
  return Localeedit;

});
