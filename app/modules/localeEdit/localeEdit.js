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
  //,
  //'libs/backbone/localstorage'

],

// Map dependencies from above array.
function(app, jquery, Views ) {

  // Create a new module.
  var Localeedit = app.module();

  Localeedit.ItemModel = Backbone.Model.extend({
           defaults: {
           Key:  'Key',
           Value: 'Value',
           Active: false
       },
       initialize: function() { 
            console.log('new Locale ItemModel');
       }
  });

  // Default Model.
  Localeedit.Model = Backbone.Model.extend({
           defaults: {
           Entries:  [],
           NameSpace: 'Intranet.Locale'
       },
       initialize: function() { 
            console.log('new Locale Model');
       }
  });

  // Default Collection.
  Localeedit.Collection = Backbone.Collection.extend({
    model: Localeedit.Model,
    url: '/api/getworkinglocales',

    parse : function(resp, xhr) {
      return resp.Locales;
    },

    initialize: function () {
        this.fetch({
            success: this.fetchSuccess,
            error: this.fetchError
        });
        this.deferred = new $.Deferred();
    },
    deferred: Function.constructor.prototype,
    fetchSuccess: function (collection, response) {
        collection.deferred.resolve();
    },
    fetchError: function (collection, response) {
        throw new Error("getworkinglocales fetch did get collection from API");
    }

  });

// Default views
  Localeedit.Views = Views;


  Localeedit.InitFileListUi = function() {
        var $fileListWrapper = $('.file-list-wrapper')
        return $.ajax({
                url: '/api/currentfiles'
            }).success(function(data) {
                $.each(data,function(index, value){
                    var $fileWrapper = $('<div>',{
                        'class': ' well well-large file'
                    }).appendTo($fileListWrapper);

                    var $text = $('<span>', {
                        'class' : "label label-info pull-left"
                    }).appendTo($fileWrapper);
                    $text.html(value.name);

                    var $btnDelete = $('<button>', {
                        type : "button",
                        'class' : "pull-right btn btn-primary",
                         'data-loading-text' : "deleteing"
                    }).appendTo($fileWrapper);
                    $btnDelete.html('Löschen');
                    $btnDelete.click(function(){
                        $.ajax({    url: 'http://192.168.2.102:8081/upload/'+value.name
                                }).success(function(data){
                                    console.log(data);
                                });
                    });

                    var $btn = $('<button>', {
                        type : "button",
                        'class' : "pull-right btn btn-primary",
                         'data-toggle' :  "button"
                    }).appendTo($fileWrapper);
                    $btn.html('Fuer Bearbeitung übernemmen');
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
        url: '/upload'
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
            url: '/upload',
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
                url: '/upload',
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
