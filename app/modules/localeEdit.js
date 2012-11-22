// Localeedit module
define([
  // Application.
  "app",
  "jquery",
  "modules/localeEdit/views",  
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
function(app, jquery, Views ) {

  // Create a new module.
  var Localeedit = app.module();

  // Default Model.
  Localeedit.Model = Backbone.Model.extend({
        
  });

  // Default Collection.
  Localeedit.Collection = Backbone.Collection.extend({
    model: Localeedit.Model
    //,

    // Save all of the items under the `"foo"` namespace.
    //localStorage: new Store('localeEdit-backbone'),
  });

// Default views
  Localeedit.Views = Views;



  Localeedit.InitFileListUi = function() {
        var $fileListWrapper = $('.file-list-wrapper')
        return $.ajax({
                url: 'http://192.168.2.102:8081/api/currentfiles'
            }).success(function(data) {
                $.each(data,function(index, value){
                    var $fileWrapper = $('<div>',{
                        'class': ' well well-large file'
                    }).appendTo($fileListWrapper);

                    var $text = $('<span>', {
                        'class' : "label label-info pull-left"
                    }).appendTo($fileWrapper);
                    $text.html(value.name);

                    var $btn = $('<button>', {
                        type : "button",
                        'class' : "pull-right btn",
                         'data-toggle' :  "button"
                    }).appendTo($fileWrapper);
                    $btn .html('Fuer Bearbeitung übernemmen');
                })
                

            })
            .fail(function () {
                $('<span class="alert alert-error"/>')
                    .text('Upload server currently unavailable - ' +
                            new Date())
                    .appendTo('#fileupload');
            });
  };

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

  };



  // Return the module for AMD compliance.
  return Localeedit;

});
