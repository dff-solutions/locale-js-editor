//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081)
    , ip = (process.env.IP || '127.0.0.1')
    , fs = require('fs')
    , path = require('path')
    , upload = require('jquery-file-upload-middleware')
    , filemanager = require('./localeEditFileManager')
    , passport = require('passport')
    , util = require('util')
    , LocalStrategy = require('passport-local').Strategy;    

var users = [
    { id: 1, username: 'admin', password: 'mclaren', email: 'bob@example.com' }
  , { id: 2, username: 'stephan', password: 'mclaren', email: 'joe@example.com' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));



//Setup Express
var server = express.createServer();
server.configure(function(){
  server.set('views', __dirname + '/views');
  server.set('view options', { layout: false });  
  server.set('view engine', 'ejs');
//  server.use(express.logger());
  server.use(express.cookieParser());
  //server.use(express.bodyParser());
  server.use(express.methodOverride());
  server.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  server.use(passport.initialize());
  server.use(passport.session());
  server.use(server.router);
  server.use(express.static(__dirname + '/../../public'));


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


server.listen( port );

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
 

server.get('/', indexRequest);
server.get('/edit', indexRequest);
server.get('/overview', indexRequest);

function indexRequest (req, res){
  fs.readFile('index.html',function (err, data){
      res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
      res.write(data);
      res.end();
  });
}


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

//get a array of uploaded js files which represent the basis for our future work
server.get('/api/currentfiles', filemanager.GetUserFiles);

//get the locales as json array of locale objects
server.get('/api/getworkinglocales', filemanager.GetCurrentWorkingLocales);

server.get('/vendor/*', staticRequest);
server.get('/app/*',  staticRequest);
server.get('/app/img',  staticRequest);
server.get('/main.html', ensureAuthenticated,  staticRequest);
server.get('/static/*',  staticRequest);
server.get('/assets/*',  staticRequest);


function staticRequest (req, res){
                        console.log(req.url);
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
};



server.get('/login', function(req, res){
  res.render('login', { user: req.user, message: req.flash('error') });
});

server.post('/upload', uploadfoo);


function uploadfoo (req , res){

    var userFolder  = filemanager.GetUserFolderName(req);

    upload({    
                    uploadUrl: __dirname + '/node_modules/jquery-file-upload-middleware/public/files/' + userFolder,
                    uploadDir: __dirname + '/node_modules/jquery-file-upload-middleware/public/files/' + userFolder,
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
                })(req, res);
};

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
server.post('/login', express.bodyParser(),
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
  
// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.
/*
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });
  })(req, res, next);
});
*/

server.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
console.log('Listening on ' + ip +  ':' + port );
