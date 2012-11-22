//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081)
    , fs = require('fs')
    , path = require('path')
    , upload = require('jquery-file-upload-middleware')
    , myFirstFormStrategy= require('./myFirstFormStrategy')
    , filemanager = require('./localeEditFileManager');



//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });

    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);

    server.use( myFirstFormStrategy() )

    server.use('/upload', upload({
                    uploadUrl: '/node_modules/jquery-file-upload-middleware/public/files',
                    tmpDir: '/tmp',
                    maxPostSize: 11000000000, // 11 GB
                    minFileSize: 1,
                    maxFileSize: 10000000000, // 10 GB
                    acceptFileTypes: /.+/i,
                    // Files not matched by this regular expression force a download dialog,
                    // to prevent executing any scripts in the context of the service domain:
                    safeFileTypes: /\.(js)$/i,
                    imageTypes: /\.(js)$/i,
                    imageVersions: {
                        thumbnail: {
                            width: 80,
                            height: 80
                        }
                    },
                    accessControl: {
                        allowOrigin: '*',
                        allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE'
                    }        
                }));
    server.use(express.bodyParser());
});


//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});


server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////
 
server.get('/', function(req,res){
        //req.authenticate(['someName'], function(error, authenticated) {
                   fs.readFile('index.html',function (err, data){
                        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
                        res.write(data);
                        res.end();
                    });
        //});
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});


server.get('/node_modules/jquery-file-upload-middleware/public/files/*', function(req, res){
    var filePath = '.' + req.url;
    
    var extname = path.extname(filePath);
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                }
                else {
                    res.writeHead(200, { 'Content-Type':  "image/" + extname });
                    res.end(content, 'utf-8');
                }
            });
        }
        else {

        console.log('---');
        console.log(req.url);
        console.log('---');
            res.writeHead(404);
            res.end();
            //throw new NotFound;
        }
    });
});

//A Route for Creating a 500 Error (Useful to keep around)
server.get('/api/currentfiles', filemanager.GetUserFiles);

server.get('/*', function(req, res){
    var filePath = '.' + req.url.split('?')[0];
    
    var extname = path.extname(filePath);
    console.log(extname);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                }
                else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        }
        else {
                if(extname.length === 0) {
                    fs.readFile('index.html',function (err, data){
                        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
                        res.write(data);
                        res.end();
                    }); 
                }else{
                    console.log('---');
                    console.log(req.url);
                    console.log('---');
                    res.writeHead(404);
                    res.end();
                    //throw new NotFound;                    
                }

        }
    });
});




function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
