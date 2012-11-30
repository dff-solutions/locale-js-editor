var fs = require('fs')
   , path = require('path')
   , vm = require('vm')
   , util = require('util')
   , linq  = require('linq')   
   , sandbox = {
      Intranet: {
      	Locale: {},
      	namespace : function() {  }
      }
    },
    intranetLocaleContext = vm.createContext(sandbox);




function getUserFolder(req){

    var dirName =  __dirname +'/files/user_' + req.session.passport.user;

	if (path.existsSync(dirName)) { // or fs.existsSync
	    return dirName;
	}else{
		fs.mkdir(dirName, function (err) {
            if (err) {
            	console.log('ERROR Creating Folde for User : ' + req.session.passport.user);
            } else {

            	fs.mkdir(dirName+'/thumbnail', function (err) {
		            if (err) {
		            	console.log('ERROR Creating Folder thumbnail for User : ' + req.session.passport.user);
		            }
		        })
                return dirName;
            }
        })
	}
};



exports.GetUserFolderName = function(req) {

	getUserFolder(req);

	return 'user_' + req.session.passport.user;	
};

exports.GetUserFiles = function(req, res) {
	var dirName = getUserFolder(req);
    console.log('Retrieving UserFiles: ');
	fs.readdir(dirName, function(err, files){

		var jsOnlyFiles = [];

		for (var i in files) {
		  var file = files[i];
		  if(file.indexOf('js') !==  -1 ){
		  	jsOnlyFiles.push(file);
		  }
		}

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(
					        	jsOnlyFiles.map(function (file)
					        	{
					        		return { url: '/files/' +  file,
					        				 name: file,
					        				 deleteUrl: req.originalUrl +  file }; })
					        	));
					        		res.end();
	});
};


exports.SaveLocales = function(req, res) {

	var data = "",
		jsonData  ;	
	req.addListener('data', function(chunk) { data += chunk; });
        req.addListener('end', function() {
            jsonData = JSON.parse(data);
            saveLocaleJsonToFiles(jsonData,function(){
	            res.writeHead(200, {'content-type': 'text/plain' });
	            res.end()            	
            })
        });
};

function saveLocaleJsonToFiles = function(data, callback){

	
	callback();
}

exports.DeleteUserFile  = function(req, res) {
	var dirName = getUserFolder(req);
    console.log('Retrieving UserFiles: ');

    var fileToDelete =req.body.Filename;
	
    fs.unlink(dirName + '/' + fileToDelete, function (err) {
	  if (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify( { state: 'error'}));
		res.end();
	  } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify( { state: 'success'}));
		res.end();	  	
	  }
	});

};

function parseLocaleJs (array) {
	var nameSpace = '';
	var entries = [];
	var line = '';
	var key = '';
	var value = '';

	for(i in array) {
		if(i !== 0 ) {
		    console.log(array[i]);
		    line = array[i];

		    if(i == 1 ) {
		   		nameSpace = line.split('=')[0];
		    }else{

		    	entries.push(line);
		    }
		}
	}
	return {
		NameSpace : nameSpace,
		Entries : entries
	}
};

function parseLocaleJs (array) {
	var nameSpace = '';
	var entries = [];
	var line = '';
	for(i in array) {
		if(i !== 0 ) {
		    console.log(array[i]);
		    line = array[i];

		    if(i == 1 ) {
		   		nameSpace = line.split('=')[0];
		    }else{
		    	entries.push(line);
		    }
		}
	}
	return {
		NameSpace : nameSpace,
		Entries : entries
	}
};

function toMultiLocaleItem (Locales){

	var multiLocaleList = {};

	for (var language in Locales) {
	   var lang = Locales[language];
	   for (var prop in lang) {
	   	  var existing = multiLocaleList[prop] || {Values: []};
	   	  var localValue = { Language: language,
	   	  	                 Value: lang[prop].toString()
	   	  					  }
	   	  existing.Values.push(localValue);
		  multiLocaleList[prop] = existing;
	   }
	}

	var multiLocaleArray = [];
	for (var prop in multiLocaleList) {
		var v = multiLocaleList[prop];

		multiLocaleArray.push({
			LocaleKey: prop,
			LocaleValues: v.Values
		});
	}

	return multiLocaleArray;

}

exports.GetCurrentWorkingLocales = function(req, res) {
	var dirName = getUserFolder(req);
	var locales = [];
	fs.readdir(dirName, function(err, files){

		var jsOnlyFiles = [];
		var multiLocaleItem = {};	

		var fileOnlyNames = [];
		
		for (var i in files) {

		    var fileName = dirName + '/' + files[i];
			var stats = fs.lstatSync(fileName);

			if (stats.isFile()) {
				fileOnlyNames.push(fileName);
			}
		}

		var done = 0;
		for (var i in fileOnlyNames) {

		    var fileName = dirName + '/' + files[i];
			var stats = fs.lstatSync(fileName);


				fs.readFile(fileName, function handleFile(err, data) {
					    vm.runInContext(data, intranetLocaleContext);
						multiLocaleItem = toMultiLocaleItem(intranetLocaleContext.Intranet.Locale);	
						done += 1;

						if(done == fileOnlyNames.length  ) {
							res.writeHead(200, { 'Content-Type': 'application/json' });
							res.write( JSON.stringify(multiLocaleItem) );
							res.end();
						}			
					});
		}
	});
};

exports.GetCurrentWorkingLocalesOld = function(req, res) {
	var dirName = getUserFolder(req);
	var locales = [];
	fs.readdir(dirName, function(err, files){

		var jsOnlyFiles = [];

		for (var i in files) {

		    var fileName = dirName + '/' + files[i];
			var stats = fs.lstatSync(fileName);

			if (stats.isFile()) {
				var array = fs.readFileSync(fileName).toString().split("\n");

				fs.readFile(fileName, function handleFile(err, data) {

					    vm.runInContext(data, intranetLocaleContext);
						console.log(intranetLocaleContext);	
						console.log(toMultiLocaleItem(intranetLocaleContext.Intranet.Locale));	
					    	
					});

				var l = parseLocaleJs(array);
				locales.push(l);

			}

		}

         res.writeHead(200, { 'Content-Type': 'application/json' });
         res.write(
         	JSON.stringify({
         						Locales: locales
         					})
         		);
		res.end();
	});


};