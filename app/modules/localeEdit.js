// Localeedit module
define([
  // Application.
  "app",
  "jquery",
  "jquery.ui.widget",   
  "canvas-to-blob",
  "load-image",   
  "tmpl.min",
  "jquery.fileupload-fp",   
  "jquery.fileupload"
  

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

  // Default View.
  Localeedit.Views.Layout = Backbone.Layout.extend({
    template: "localeedit"
  });

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
