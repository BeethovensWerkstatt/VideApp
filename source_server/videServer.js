/*Vi=de app Server*/
"use strict";

var serverConfig = require('./serverConfig.json');
var mode = 'dev'; // 'live' or 'dev'

serverConfig = serverConfig[mode];

var app = require('express')();
var express = require('express');
var http = require('http').Server(app);

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var backend = require('./backend');
var ensureLogin = require('connect-ensure-login');
app.use(require('body-parser').urlencoded({ extended: true }));

/* Configure the local strategy for use by Passport.
  
   The local strategy require a `verify` function which receives the credentials
   (`username` and `password`) submitted by the user.  The function must verify
   that the password is correct and then invoke `cb` with a user object, which
   will be set at `req.user` in route handlers after authentication.
*/ 
passport.use(new Strategy(
  function(username, password, cb) {
    backend.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


/*  Configure Passport authenticated session persistence.
  
   In order to restore authentication state across HTTP requests, Passport needs
   to serialize users into and deserialize users out of the session.  The
   typical implementation of this is as simple as supplying the user ID when
   serializing, and querying the user record by ID from the database when
   deserializing.
  */
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  backend.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


var cookieParser = require('cookie-parser')

var io = require('socket.io')(http);
var rethink = require('rethinkdb');
var fetch = require('isomorphic-fetch');

var eXist = {
    uri: serverConfig.eXist.url
}

var rethinkConnection = null;

//build basic Rethink parameter object
var rethinkConnectionObject = {
    host: serverConfig.rethink.host, 
    port: serverConfig.rethink.port
}

//add user and pass only if needed, or ReThink will complain
if(serverConfig.rethink.login !== '') {
    rethinkConnectionObject.user = serverConfig.rethink.login;
    rethinkConnectionObject.password = serverConfig.rethink.pass;
}

rethink.connect(rethinkConnectionObject, function(err, conn) {
    if (err) {throw err;}
    rethinkConnection = conn;
    
    //add tables if they aren't there yet
    rethink.tableList().run(rethinkConnection, function(err, result) {
        if (err) {throw err;}
            
        if(result.indexOf('states') === -1) {
            rethink.tableCreate('states').run(rethinkConnection, function(err, result) {
                if (err) {throw err;}
                console.log('Added table "states" to RethinkDB');
            });
        }
        if(result.indexOf('sessions') === -1) {
            rethink.tableCreate('sessions').run(rethinkConnection, function(err, result) {
                if (err) {throw err;}
                console.log('Added table "sessions" to RethinkDB');
            });
        }
        if(result.indexOf('cache') === -1) {
            rethink.tableCreate('cache').run(rethinkConnection, function(err, result) {
                if (err) {throw err;}
                console.log('Added table "cache" to RethinkDB');
            });
        }
        if(result.indexOf('requests') === -1) {
            rethink.tableCreate('requests').run(rethinkConnection, function(err, result) {
                if (err) {throw err;}
                console.log('Added table "requests" to RethinkDB');
            });  
        }
    });
    
});

//simple function to generate uuid
Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
};

//this logs requests to the rethink server
var logRequest = function(uri,type,dur,cached) {
    
    rethink.table('requests').insert({
        type: type,
        uri: uri,
        duration: dur,
        cached: cached,
        when: Date.now()
    }).run(rethinkConnection, function(err, result) {
        if (err) {throw err;}
        //console.log('[LOG] logged request to RethinkDB: ' + uri + ' | ' + dur + ' | ' + cached + ' | ' + Date.now())
    });
    
};

//this function checks if the data is available 
var retrieveData = function(uri, format, type, cacheable,socket,key) {
    
    var start = Date.now();
    
    //if request can be stored in rethink
    if(cacheable) {
        //retrieve cached value
        rethink.table('cache').get(uri).run(rethinkConnection, function(err, result) {
            if (err) {throw err;}
            
            //check if value has been cached before
            if(result !== null) {
                
                var dur = (Date.now() - start);
                logRequest(uri,type,dur,true);
                
                if(format === 'json' && typeof result.res === 'string') {
                    socket.emit(key,JSON.parse(result.res));    
                } else if(format === 'json' && typeof result.res === 'object') {
                    socket.emit(key,result.res);    
                } else {
                    //todo: are XML-based results correct like this?
                    socket.emit(key,result.res);    
                }
                
                
            //if value hasn't been cached, do it now
            } else {
                fetch(uri)
                .then(function(dbRes){
                
                    if(format === 'json') {
                        return dbRes.json();
                    } else if(format === 'xml') {
                        return dbRes.text();
                    }
                    
                    return dbRes.json();
                })
                .then(function(res) {
                    
                    var now = Date.now();
                    var dur = (now - start);
                    rethink.table('cache').insert({id:uri, format:format, date:now, dur:dur, res:res}).run(rethinkConnection, function(err, result) {
                        if (err) {throw err;}
                        //console.log('[INFO] Successfully cached ' + uri);
                         
                    });
                    
                    logRequest(uri,type,dur,false);
                    socket.emit(key,res);
                });
            }
        });
        
    
    //if value can't be cached, get it from eXist directly
    } else {
        fetch(uri)
        .then(function(dbRes){
            
            if(format === 'json') {
                return dbRes.json();
            } else if(format === 'xml') {
                return dbRes.text();
            }
            
            return dbRes.text();
        })
        .then(function(res) {
            var dur = (Date.now() - start);
            logRequest(uri,type,dur,false);
            
            socket.emit(key,res);
        });
    }

}

//this function refreshes a given output in the cache
//todo: merge with retrieveData
var refreshCache = function(uri,format) {

    var start = Date.now();

    return fetch(uri)
    .then(function(dbRes){
    
        if(format === 'json') {
            return dbRes.json();
        } else if(format === 'xml') {
            return dbRes.text();
        }
        
        return dbRes.json();
    })
    .then(function(res) {
        
        var now = Date.now();
        var dur = (now - start);
        rethink.table('cache').get(uri).update({id:uri, format:format, date:now, dur:dur, res:res}).run(rethinkConnection, function(err, result) {
            if (err) {throw err;}
        });
        
        return {
            id:uri, 
            format:format, 
            date:now, 
            dur:dur
        }
        
        //log to different db table with administrative information
        //logRequest(uri,type,dur,false);
    });
} 

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//app.use('/', express.static(__dirname));
app.use('/resources',express.static(__dirname + '/resources'));
app.use(express.static('data'));
app.use(cookieParser());

app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'quasemjklasdadkkasdjk', resave: false, saveUninitialized: false }));


// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

//redirect to login-page
app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/backend/login.html');
});

//login credentials
app.post('/login', 
  passport.authenticate('local', { 
    failureRedirect: '/login',
    successRedirect: '/backend'}),
  function(req, res) {
    res.redirect('/backend');
  });

app.get('/backend', ensureLogin.ensureLoggedIn(),
    function(req, res) {
    
        rethink.table('cache').orderBy(rethink.desc('dur')).without('res').run(rethinkConnection, function(err, cursor) {
            if (err) {throw err;}  
            
            cursor.toArray(function(err, result) {
                if (err) throw err;
                
                res.render('backend',{
                    user: req.user,
                    cache: result
                }); 
                
            });
            
        });
    
        
    });
    
app.get('/refreshCache', ensureLogin.ensureLoggedIn(),
    function(req,res) {
        
        try {
            var uri = req.query.uri;
            var format = req.query.format;
            refreshCache(uri,format)
            .then(function(item) {
                res.json(item);
            });
        } catch(err) {
            console.log('[ERROR] Unable to refresh cache. Error message: ' + err);
        }
    });

app.get('/downloadFromCache', ensureLogin.ensureLoggedIn(),
    function(req,res) {
        
        try {
            var uri = req.query.uri;
            rethink.table('cache').get(uri).run(rethinkConnection, function(err, result) {
                if (err) {throw err;}  
                
                res.json(result); 
                
            });
        } catch(err) {
            console.log('[ERROR] Unable to retrieve from cache. Error message: ' + err);
        }
        
        
    });

// this route should go away at some point
app.get('/emptyCache', function(req, res) {

    rethink.table('cache').delete().run(rethinkConnection, function(err, result) {
        if (err) {throw err;}        
        res.send('Cache has been emptied');
    });
});

// avoid duplicate code with and without hash route
app.get('/:hash', function(req, res){
    
    //console.log('[INFO] Requesting file')
    let sessionID = 'session_' + Math.uuidCompact();
    let user = req.cookies.userID;
    
    if(user === 'undefined')
        user = 'user_' + Math.uuidCompact();
    
    res.cookie('userID', user, { maxAge: 300000000000 });
    res.clearCookie('sessionID');
    res.cookie('sessionID', sessionID);
    
    let hash = req.params.hash;
    if(hash !== '')
        //console.log('Requesting hash ' + hash);
    
    if(req.cookies.sessionID) {
        //console.log('session is ' + req.cookies.sessionID + ' (in contrast to ' + sessionID + ')');
    }
    
    var socketSession = sessionID;
    
    io.of(socketSession).on('connection', function(socket) {
        
        console.log('INFO: Opening socket connection at ' + socketSession);
        
        //is this useful at all?
        socket.on('msg', function(message) {
            console.log('received message from ' + message.sender + ':');
            console.log(message);
        });
        
        socket.on('logSession', function(message) {
            console.log('[logSession] new session ' + message.id);
            
            rethink.table('sessions').insert(message).run(rethinkConnection, function(err, result) {
                if (err) {throw err;}
                /*if(result.errors.length > 0) {
                    console.log('failed to add session')
                } else {
                    console.log('added new session')    
                }*/
                
                //console.log(JSON.stringify(result, null, 2));
            });    
            
        });
        
        socket.on('logState', function(message) {
            //console.log('[rethink] log state ' + message.id + ' for session ' + message.session);
            //console.log(message)
            
            rethink.table('sessions').get(message.session)            
                .update({states: rethink.row('states').append({timestamp: message.timestamp, hash: message.id})})
                .run(rethinkConnection, function(err, result) {
                    if (err) {throw err;}
                    /*console.log('added state into session')
                    console.log(JSON.stringify(result, null, 2));       */             
                });
            
            rethink.table('states').insert({id: message.id, state: message.state}).run(rethinkConnection, function(err, result) {
                if (err) {throw err;}
                /*if(result.errors.length > 0) {
                    console.log('failed to add state')
                } else {
                    console.log('added state')
                }*/
                //console.log(JSON.stringify(result, null, 2));
            });
        
        })
        
        socket.on('requestState',function(message) {
            //console.log('requesting hash ' + message.hash + ' for socket ' + message.socket);
            rethink.table('states').get(message.hash).run(rethinkConnection, function(err, result) {
                if (err) {throw err;}
                socket.emit('sendState',{hash: message.hash, socket: message.socket, state: result.state});
            });
        })
        
        socket.on('requestData', function(req) {
            
            var dbReq = eXist.uri;
            var resType = 'json';
            var cacheable = false;
            
            //console.log(dbReq)
            
            switch(req.type) {
                case 'getXmlFile': 
                    dbReq += 'file/' + req.id + '.xml'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getPages': 
                    dbReq += 'edition/' + req.id + '/reconstructionSetup.json'; 
                    resType = 'json';
                    cacheable = true;
                    break;
                case 'getStates': 
                    dbReq += 'edition/' + req.id + '/states/overview.json'; 
                    resType = 'json';
                    cacheable = true;
                    break;
                case 'getState': 
                    dbReq += 'edition/' + req.edition + '/state/' + req.id + '/otherStates/' + ((req.otherStates.length > 0) ? req.otherStates.join('___') : '_') + '/meiSnippet.xml'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getScarCategories': 
                    dbReq += 'edition/' + req.id + '/scars/categories.json'; 
                    resType = 'json';
                    cacheable = true;
                    break;
                case 'getMeasures': 
                    dbReq += 'edition/' + req.id + '/measures.json'; 
                    resType = 'json';
                    cacheable = true;
                    break;
                case 'getShapeInfo': 
                    dbReq += 'edition/' + req.edition + '/shape/' + req.id + '/info.json'; 
                    resType = 'json';
                    cacheable = false;
                    break;
                case 'getShapesForObject': 
                    dbReq += 'edition/' + req.edition + '/object/' + req.id + '/shapes.json'; 
                    resType = 'json';
                    cacheable = false;
                    break;
                case 'getInvariance': 
                    dbReq += 'edition/' + req.edition + '/invarianceRelations.json'; 
                    resType = 'json';
                    cacheable = true;
                    break;
                case 'getElementDesc':
                    dbReq += 'edition/' + req.edition + '/element/' + req.id + '/en/description.json'; 
                    resType = 'json';
                    cacheable = false;
                    break;
                case 'getPageShapesSvg': 
                    dbReq += 'file/' + req.id + '.svg'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getRenderedPageOverlay': 
                    dbReq += 'file/' + req.id + '.svg'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getElementXml': 
                    dbReq += 'edition/' + req.edition + '/element/' + req.id + '.xml'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getFinalState': 
                    dbReq += 'edition/' + req.id + '/finalState.xml'; 
                    resType = 'xml';
                    cacheable = false;
                    break;    
                case 'getIntroText': 
                    dbReq += 'edition/' + req.id + '/introduction.html'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getElementFacsimileInfo':
                    dbReq += 'edition/' + req.edition + '/element/' + req.id + '/450,130/facsimileInfo.json'; 
                    resType = 'json';
                    cacheable = false;
                    break; 
                case 'getTranscriptionPreview': 
                    dbReq += 'edition/' + req.edition + '/element/' + req.id + '/states/' + ((req.otherStates.length > 0) ? req.otherStates.join('___') : '_') + '/preview.xml'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                default: 
                    dbReq = '';
            }
            
            if(dbReq !== '') {
                retrieveData(dbReq,resType,req.type,cacheable,socket,req.key);
                
            } else {
                socket.emit(req.key,'{"error":"request not supported"}')    
            }
            
            
        })
        
    });
    
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res){
    
    console.log('[INFO]: Requesting file')
    
    let sessionID = 'session_' + Math.uuidCompact();
    let user = req.cookies.userID;
    
    if(user === 'undefined')
        user = 'user_' + Math.uuidCompact();
    
    res.cookie('userID', user, { maxAge: 300000000000 });
    res.clearCookie('sessionID');
    res.cookie('sessionID', sessionID);
    
    /* COPIED CODE START */
    //this needs to be moved to a proper function
    var socketSession = sessionID;
    
    io.of(socketSession).on('connection', function(socket) {
        
        console.log('INFO: Opening socket connection at ' + socketSession);
        
        //is this useful at all?
        socket.on('msg', function(message) {
            console.log('received message from ' + message.sender + ':');
            console.log(message);
        });
        
        socket.on('logSession', function(message) {
            console.log('[logSession] new session ' + message.id);
            
            rethink.table('sessions').insert(message).run(rethinkConnection, function(err, result) {
                if (err) {throw err;}
                /*if(result.errors.length > 0) {
                    console.log('failed to add session')
                } else {
                    console.log('added new session')    
                }*/
                
                //console.log(JSON.stringify(result, null, 2));
            });    
            
        });
        
        socket.on('logState', function(message) {
            //console.log('[rethink] log state ' + message.id + ' for session ' + message.session);
            //console.log(message)
            
            rethink.table('sessions').get(message.session)            
                .update({states: rethink.row('states').append({timestamp: message.timestamp, hash: message.id})})
                .run(rethinkConnection, function(err, result) {
                    if (err) {throw err;}
                    /*console.log('added state into session')
                    console.log(JSON.stringify(result, null, 2));       */             
                });
            
            rethink.table('states').insert({id: message.id, state: message.state}).run(rethinkConnection, function(err, result) {
                if (err) {throw err;}
                /*if(result.errors.length > 0) {
                    console.log('failed to add state')
                } else {
                    console.log('added state')
                }*/
                //console.log(JSON.stringify(result, null, 2));
            });
        
        })
        
        socket.on('requestState',function(message) {
            //console.log('requesting hash ' + message.hash + ' for socket ' + message.socket);
            rethink.table('states').get(message.hash).run(rethinkConnection, function(err, result) {
                if (err) {throw err;}
                socket.emit('sendState',{hash: message.hash, socket: message.socket, state: result.state});
            });
        })
        
        socket.on('requestData', function(req) {
            
            var dbReq = eXist.uri;
            var resType = 'json';
            var cacheable = false;
            
            //console.log(dbReq)
            
            switch(req.type) {
                case 'getXmlFile': 
                    dbReq += 'file/' + req.id + '.xml'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getPages': 
                    dbReq += 'edition/' + req.id + '/reconstructionSetup.json'; 
                    resType = 'json';
                    cacheable = true;
                    break;
                case 'getStates': 
                    dbReq += 'edition/' + req.id + '/states/overview.json'; 
                    resType = 'json';
                    cacheable = true;
                    break;
                case 'getState': 
                    dbReq += 'edition/' + req.edition + '/state/' + req.id + '/otherStates/' + ((req.otherStates.length > 0) ? req.otherStates.join('___') : '_') + '/meiSnippet.xml'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getScarCategories': 
                    dbReq += 'edition/' + req.id + '/scars/categories.json'; 
                    resType = 'json';
                    cacheable = true;
                    break;
                case 'getMeasures': 
                    dbReq += 'edition/' + req.id + '/measures.json'; 
                    resType = 'json';
                    cacheable = true;
                    break;
                case 'getShapeInfo': 
                    dbReq += 'edition/' + req.edition + '/shape/' + req.id + '/info.json'; 
                    resType = 'json';
                    cacheable = false;
                    break;
                case 'getShapesForObject': 
                    dbReq += 'edition/' + req.edition + '/object/' + req.id + '/shapes.json'; 
                    resType = 'json';
                    cacheable = false;
                    break;
                case 'getInvariance': 
                    dbReq += 'edition/' + req.edition + '/invarianceRelations.json'; 
                    resType = 'json';
                    cacheable = true;
                    break;
                case 'getElementDesc':
                    dbReq += 'edition/' + req.edition + '/element/' + req.id + '/en/description.json'; 
                    resType = 'json';
                    cacheable = false;
                    break;
                case 'getPageShapesSvg': 
                    dbReq += 'file/' + req.id + '.svg'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getRenderedPageOverlay': 
                    dbReq += 'file/' + req.id + '.svg'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getElementXml': 
                    dbReq += 'edition/' + req.edition + '/element/' + req.id + '.xml'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getFinalState': 
                    dbReq += 'edition/' + req.id + '/finalState.xml'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                case 'getIntroText': 
                    dbReq += 'edition/' + req.id + '/introduction.html'; 
                    resType = 'xml';
                    cacheable = false;
                    break; 
                case 'getElementFacsimileInfo':
                    dbReq += 'edition/' + req.edition + '/element/' + req.id + '/450,130/facsimileInfo.json'; 
                    resType = 'json';
                    cacheable = false;
                    break;
                case 'getTranscriptionPreview': 
                    dbReq += 'edition/' + req.edition + '/element/' + req.id + '/states/' + ((req.otherStates.length > 0) ? req.otherStates.join('___') : '_') + '/preview.xml'; 
                    resType = 'xml';
                    cacheable = false;
                    break;
                default: 
                    dbReq = '';
            }
            
            if(dbReq !== '') {
                retrieveData(dbReq,resType,req.type,cacheable,socket,req.key);
                
            } else {
                socket.emit(req.key,'{"error":"request not supported"}')    
            }
            
            
        })
        
    });
    
    /* COPIED CODE END */
    
    res.sendFile(__dirname + '/index.html');
});

http.listen(serverConfig.app.port, function(){

    console.log('Serving VideApp from ' + serverConfig.app.host + ':' + serverConfig.app.port);
    
});

