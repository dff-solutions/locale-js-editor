//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , port = (process.env.PORT || 8081)
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
var app = express();
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view options', { layout: false });  
  app.set('view engine', 'ejs');
//  app.use(express.logger());
  app.use(express.cookieParser());
  //app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/../../public'));
  app.use(express.errorHandler({ 
        dumpExceptions: true, 
        showStack: true 
    }));
});



app.listen( port );




///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////
 

app.get('/', indexRequest);
app.get('/index', indexRequest);
app.get('/edit', indexRequest);
app.get('/overview', indexRequest);

app.get('/upload', function indexRequest (req, res){
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end();
});

function indexRequest (req, res){
  fs.readFile('index.html',function (err, data){
      res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
      res.write(data);
      res.end();
  });
}


//A Route for Creating a 500 Error (Useful to keep around)
app.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});


app.get('/files/*', function(req, res){
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
app.get('/api/currentfiles', filemanager.GetUserFiles);
//get the locales as json array of locale objects
app.get('/api/getworkinglocales', filemanager.GetCurrentWorkingLocales);
app.post('/api/deleteUserFile',express.bodyParser(), filemanager.DeleteUserFile);
app.post('/api/savelocales',express.bodyParser(), filemanager.SaveLocales);


app.get('/vendor/*', staticRequest);
app.get('/app/*',  staticRequest);
app.get('/app/img',  staticRequest);
app.get('/index.html', ensureAuthenticated,  staticRequest);
app.get('/main.html', ensureAuthenticated,  staticRequest);
app.get('/static/*',  staticRequest);
app.get('/assets/*',  staticRequest);


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



app.get('/login', function(req, res){
  res.render('login', { user: req.user, message: '' });
});

app.post('/upload', uploadHandler);


function uploadHandler (req , res){

    var userFolder  = filemanager.GetUserFolderName(req);

    upload({    
                    uploadUrl: __dirname + '/files/' + userFolder,
                    uploadDir: __dirname + '/files/' + userFolder,
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
app.post('/login', express.bodyParser(),
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/logout', function(req, res){
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
console.log('Listening on 0.0.0.1 :' + port );
