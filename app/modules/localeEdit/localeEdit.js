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
           Language:  'XX',
           Value: 'Foo',
           IsFunction: false
       },
       initialize: function() { 
            console.log('new Locale ItemModel');
       }
  });

  // Default Model.
  Localeedit.Model = Backbone.Model.extend({
           defaults: {
           LocaleKey:  'LOCALKEYDEFAULT',
           LocaleValues: []
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

      return resp;
    },
    search : function(letters){
        if(letters == "") return this;
     
        var pattern = new RegExp(letters,"gi");
        return _(this.filter(function(data) {
            return pattern.test(data.get("LocaleKey"));
        }));
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
         jquery('#loadIndicator').fadeOut('slow');
    },
    fetchError: function (collection, response) {
        throw new Error("getworkinglocales fetch did get collection from API");
    }

  });

// Default views
  Localeedit.Views = Views;

  Localeedit.SaveLocales = function(data) {
    var dataAsJson = JSON.stringify(data);
    jquery('#loadIndicator').show();
    $.ajax({
                url: '/api/savelocales',
                type: 'POST',
                contentType: 'text/json',
                data: dataAsJson 

            }).success(function(data) {
                jquery('#loadIndicator').fadeOut('slow');
                console.log('Saved successfully');
            })

  };

  Localeedit.InitFileListUi = function() {
        $('.file-list-wrapper').html('');
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
                    $text.html('Name: ' +  value.name);

                    var $text = $('<span>', {
                        'class' : "label label-info pull-left"
                    }).appendTo($fileWrapper);
                    $text.html('Änderungsdatum: ' +  value.lastChange);

                    var $text = $('<span>', {
                        'class' : "label label-info pull-left"
                    }).appendTo($fileWrapper);
                    $text.html('Größe: ' +  value.size);                    

                    var $btnDelete = $('<button>', {
                        type : "button",
                        'class' : "pull-right btn btn-primary",
                         'data-loading-text' : "deleteing"
                    }).appendTo($fileWrapper);
                    $btnDelete.html('Löschen');
                    $btnDelete.click(function(){
                        $.ajax({    url: '/api/deleteUserFile/',
                                    type: 'POST',
                                    data: {
                                      Filename: value.name
                                    }
                                }).success(function(data){
                                    Localeedit.InitFileListUi();
                                });
                    });

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
