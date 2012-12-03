var jam = {
    "packages": [
        {
            "name": "backbone",
            "location": "../vendor/jam/backbone",
            "main": "backbone.js"
        },
        {
            "name": "backbone.layoutmanager",
            "location": "../vendor/jam/backbone.layoutmanager",
            "main": "backbone.layoutmanager.js"
        },
        {
            "name": "jquery",
            "location": "../vendor/jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "lodash",
            "location": "../vendor/jam/lodash",
            "main": "./lodash.js"
        },
        {
            "name": "underscore",
            "location": "../vendor/jam/underscore",
            "main": "underscore.js"
        },
        {
            "name": "jquery.fileupload-fp",
            "location": "../vendor/jam/jquery-fileupload",
            "main": "jquery.fileupload-fp.js"
        },
        {
            "name": "jquery.fileupload",
            "location": "../vendor/jam/jquery-fileupload",
            "main": "jquery.fileupload.js"
        },
        {
            "name": "jquery.fileupload-ui",
            "location": "../vendor/jam/jquery-fileupload",
            "main": "jquery.fileupload-ui"
        },{
            "name": "canvas-to-blob",
            "location": "../vendor/jam",
            "main": "canvas-to-blob.min.js"
        },{
            "name": "load-image",
            "location": "../vendor/jam",
            "main": "load-image.min.js"
        },{
            "name": "jquery.ui.widget",
            "location": "../vendor/jam",
            "main": "jquery.ui.widget.js"
        },{
            "name": "tmpl.min",
            "location": "../vendor/jam",
            "main": "tmpl.min.js"
        },{
            "name": "tmpl",
            "location": "../vendor/jam",
            "main": "tmpl.min.js"
        },{
            "name": "bootstrap",
            "location": "../vendor/jam",
            "main": "bootstrap.min.js"
        },{
            "name": "bootstrap-image-gallery",
            "location": "../vendor/jam",
            "main": "bootstrap-image-gallery.min.js"
        },{
            "name": "LocaleEdit",
            "location": "../app/modules/localeEdit",
            "main": "localeEdit.js"
        },{
            "name": "Mediator",
            "location": "../vendor/jam",
            "main": "mediator.js"
        }



    ],
    "version": "0.2.11",
    "shim": {
        "backbone": {
            "deps": [
                "jquery",
                "underscore"
            ],
            "exports": "Backbone"
        },
        "backbone.layoutmanager": {
            "deps": [
                "jquery",
                "backbone",
                "lodash"
            ],
            "exports": "Backbone.LayoutManager"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({packages: jam.packages, shim: jam.shim});
}
else {
    var require = {packages: jam.packages, shim: jam.shim};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}
