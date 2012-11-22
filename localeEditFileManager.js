var fs = require('fs');




exports.GetUserFiles = function(req, res) {
	var path = "./files";
    console.log('Retrieving UserFiles: ');
	fs.readdir(path, function(err, files){

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


/*= function (req) {
        if (!this.error) {
            var that = this,
                baseUrl = (options.ssl ? 'https:' : 'http:') +
                    '//' + req.headers.host;
            this.delete_url = baseUrl +  req.originalUrl + '/' +encodeURIComponent(this.name);
            this.url = baseUrl + options.uploadUrl + '/' +encodeURIComponent(this.name);
            Object.keys(options.imageVersions).forEach(function (version) {
                if (_existsSync(
                    options.uploadDir + '/' + version + '/' + that.name
                )) {
                    that[version + '_url'] = baseUrl +  options.uploadUrl + '/' + version + '/' + encodeURIComponent(that.name);
                }
            });
        }*/