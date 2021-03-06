var fs = require('fs')
   , path = require('path')
   , vm = require('vm')
   , util = require('util')
   , mv = require('mv')
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
		var jsOnlyFilesWithMetaInfo = [];		

		var doResponse = function() {
	        res.writeHead(200, { 'Content-Type': 'application/json' });
	        res.write(JSON.stringify(
						        	jsOnlyFilesWithMetaInfo.map(function (file)
						        	{
						        		return { url: '/files/user_' + req.session.passport.user + '/' + file.Name,
						        				 name: file.Name,
						        				 lastChange: file.mtime,
						        				 size: file.size,
						        				 deleteUrl: req.originalUrl +  file }; })
						        	));
			res.end();
		};

		// nur die js Dateien ohne Ordner
		for (var i in files) {
		  var file = files[i];
		  if(file.indexOf('js') !==  -1 ){
		  		jsOnlyFiles.push(file);
		  }
		}

		// anreichern mit meta infos
		for (var i in jsOnlyFiles) {
			var file = jsOnlyFiles[i];
			var statsDone = 0;
			
			var stats = fs.statSync(dirName+'/' + file);
			jsOnlyFilesWithMetaInfo.push({
				  			Name: file,
				  			mtime: stats.mtime,
				  			size: stats.size
				  		});
		}
		doResponse();		
	});
};

exports.DeleteRevisionFolder = function(req, res) {
	var dirName = getUserFolder(req);
    var folderToDelete = req.body.Foldername;

    var doResponse = function(err){
		if (err) {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify( { state: 'error'}));
			res.end();
		} else {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify( { state: 'success'}));
			res.end();	  	
		}
    };

    deleteFolder(dirName + '/' + folderToDelete, doResponse );

};

function deleteAllFilesInFolder(folder, callback) {
	fs.readdir(folder, function(err, files){

		// nur die js Dateien ohne Ordner
		var file = null;
		var done = 0;

		for (var i in files) {
		  file = files[i];

			var stats = fs.lstatSync(folder + '/' + file);

			if (stats.isFile()) {
				    fs.unlink(folder + '/' + file, function (err) {
						if (err) {
							console.log(err);
						} else {
							console.log('deleteAllFilesInFolder ' + folder + '/' + file);
						}
						++done;
						if(done === files.length ) {
							callback();
						}
					});
			}
		}


	});
};

function deleteFolder(folder, callback){
	
	var procceed = function(){
		fs.rmdir(folder, function  (err) {
		  if (err) {
		  	callback(true);
		  } else {
	        callback(false);	  	
		  }
		});	
	}


	deleteAllFilesInFolder(folder, procceed);

		
};

exports.SwitchToRevision = function(req, res) {
	var dirName = getUserFolder(req);
	var revisionFolderToSwitchTo = req.body.RevisionFolder;
	

};

exports.GetCurrentRevisions = function(req, res) {
	var dirName = getUserFolder(req);
    console.log('Retrieving UserFiles: ');
	fs.readdir(dirName, function(err, files){



		var dirs = [];
		var dirsWithMetaInfo = [];		

		var doResponse = function() {
	        res.writeHead(200, { 'Content-Type': 'application/json' });
	        res.write(JSON.stringify(
						        	dirsWithMetaInfo.map(function (file)
						        	{
						        		return { url: '/files/user_' + req.session.passport.user + '/' + file.Name,
						        				 name: file.Name,
						        				 lastChange: file.mtime,
						        				 size: file.size,
						        				 deleteUrl: req.originalUrl +  file }; })
						        	));
			res.end();
		};

		// nur die js Dateien ohne Ordner
		for (var i in files) {
		  var file = files[i];
		  if(file.indexOf('js') ===  -1 && file.indexOf('thumbnail') === -1){
		  		dirs.push(file);
		  }
		}

		// anreichern mit meta infos
		for (var i in dirs) {
			var dir = dirs[i];
			var statsDone = 0;
			
			var stats = fs.statSync(dirName+'/' + dir);
			dirsWithMetaInfo.push({
				  			Name: dir,
				  			mtime: stats.mtime,
				  			size: stats.size
				  		});
		}
		doResponse();		
	});
};

exports.SaveLocales = function(req, res) {

	var data = "",
		jsonData ,	
		dirName = getUserFolder(req); 

	req.addListener('data', function(chunk) { data += chunk; });
        req.addListener('end', function() {
            jsonData = JSON.parse(data);
            saveLocaleJsonToFiles(jsonData, dirName, function(){
	            res.writeHead(200, {'content-type': 'text/plain' });
	            res.end()            	
            })
        });
};



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


function toMultiLocaleItem (Locales){

	var multiLocaleList = {};
	var existingLanguages = [];
	var allKeys = {};
	var currentValue = "";
	// SaveAll Languages
	for (var language in Locales) {
	   if(existingLanguages.indexOf(language) == -1 ){
	   		existingLanguages.push(language);
	   }		
	}

	for (var language in Locales) {
	   var lang = Locales[language];
	   for (var key in lang) {
	   	  var existing = multiLocaleList[key] || {Values: []};
	   	  currentValue = lang[key].toString();
	   	  var localValue = { Language: language,
	   	  	                 Value: currentValue,
	   	  	                 IsFunction: currentValue.substring(0,10).indexOf('function') != -1
	   	  					  }
	   	  existing.Values.push(localValue);
		  multiLocaleList[key] = existing;
	   }
	}

	var multiLocaleArray = [];
	//Object Literal zu array umwandeln
	// prüfen ob alle schlüssel in allen sprachen vorhanden sind
	for (var key in multiLocaleList) {
		var v = multiLocaleList[key];

		
		if(v.Values.length !== existingLanguages.length) 	{// es scheint als ob sprachen fehlen

			for (var l in existingLanguages)
			{
				var exists = false;
				var lang = existingLanguages[l];
				for (var value in v.Values) {
					var currentValue = v.Values[value];

					if(currentValue.Language == lang) {
						exists = true;
					}
				}
				if(!exists) {
					v.Values.push({
						Language: lang,
						Value: "!UNDEFINED-LOCALE"
					})
				}
			}
		}


		multiLocaleArray.push({
			LocaleKey: key,
			LocaleValues: v.Values
		});
	}

	return multiLocaleArray;
}


function moveExistingFilesToBackUpFolder(folder, callback){

	fs.readdir(folder, function(err, files){

		var fileOnlyNames = [];
		
		for (var i in files) {

		    var fileName = folder + '/' + files[i];
			var stats = fs.lstatSync(fileName);

			if (stats.isFile()) {
				fileOnlyNames.push(
				{
					Path:fileName,
					Name:files[i]
				});
			}
		}

		console.log('found the following files :');
		console.log(fileOnlyNames);
		var done = 0;

		var d = new Date();
		var outPutFolder = folder+ '/' +	d.getFullYear().toString()+ d.getMonth()+ d.getDay()+ d.getHours()+ d.getMinutes() + + d.getSeconds()+ "_backUp";

		fs.mkdir(outPutFolder, function (err) {
			for (var i in fileOnlyNames) {

			    var fname = fileOnlyNames[i];

				console.log('-----------------------------------');
				console.log('moving : ' +fname.Path);
				console.log('to  : ' +outPutFolder+ '/' +fname.Name);
				console.log('-----------------------------------');

				// var is = fs.createReadStream(fname.Path)
				// var os = fs.createWriteStream(outPutFolder+ '/' +fname.Name);

				// is.pipe(os);
			 //    fs.unlinkSync(fname.Path);

			    mv(fname.Path, outPutFolder+ '/' +fname.Name, function(err) {
				  // done. it tried fs.rename first, and then falls back to
				  // piping the source file to the dest file and then unlinking
				  // the source file.
				});

			}
			callback();
		});

	});
}

function saveLocaleJsonToFiles (data, dirName, callback){

	var locales = {};

	var partialFileName = "Intranet.Locale.";

	for( var i = 0 ; i < data.length; i++){
		var obj = data[i];
		var localeKey = obj.LocaleKey;
		for( var j = 0 ; j < obj.LocaleValues.length; j++)
		{
			var currentValue = obj.LocaleValues[j].Value;
			var currentLanguage = obj.LocaleValues[j].Language;
			locales[currentLanguage] = locales[currentLanguage] || {};
			locales[currentLanguage][localeKey] = currentValue;
		};
	};

	function procceed(){
		var outputString =""

		for (var lang in locales)
		{
			var current = locales[lang];

			outputString = "";
			outputString += "Intranet.namespace('Intranet.Locale."+ lang + "');\r\n";
			outputString += "Intranet.Locale."+ lang + " = {\r\n";

			for (var k in current)
			{		
				var localeValue = current[k];
				var hasSingleQuoteInside = localeValue.indexOf('\'') != -1;


				if(localeValue.substring(0,10).indexOf('function') == -1)
				{
					// Wenn der String single qoutes innerhalb hat, wert in double qoutes einpassen
					// ansonsten singleqoutes
					if(hasSingleQuoteInside){
						outputString += "    " + k + ": \"" + localeValue.replace("\n","\\n") + "\",\r\n";									
					}else{
						outputString += "    " + k + ": '" + localeValue.replace("\n","\\n") + "',\r\n";									
					}

				}else{
					// wir haben eine function! nicht in qoutes einpassen!!!
					outputString += "    " + k + ": " + localeValue + ",\r\n";			
				}

			}

			// remove last comma
			outputString = outputString.substring(0, outputString.length - 3) + "\r\n";
			outputString += "};";		


			var filename = dirName + '/'+ partialFileName + lang + ".js";
			fs.writeFile(filename, outputString, function(err) {
			    if(err) {
			        console.log(err);
			    } else {
			        console.log("The file was saved! : "  + filename);
			    }
			}); 
		}		
		callback();
	}

	// save a backUp
	moveExistingFilesToBackUpFolder(dirName,procceed);
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

		    var fileName = fileOnlyNames[i];

				fs.readFile(fileName, function handleFile(err, data) {

					intranetLocaleContext = vm.createContext(sandbox);
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