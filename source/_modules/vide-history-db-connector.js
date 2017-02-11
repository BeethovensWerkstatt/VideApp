var r = require('rethinkdb');

var connection = null;
r.connect({host: 'localhost', port: 32769}, function(err, conn) {
    if (err) {throw err;}
    connection = conn;
});


/*
r.connect({ host: 'localhost', port: 32769 }, function(err, conn) {
    if(err) throw err;
    r.db('test').tableCreate('tv_shows').run(conn, function(err, res) {
        if(err) throw err;
        console.log(res);
        r.table('tv_shows').insert({ name: 'Star Trek TNG' }).run(conn, function(err, res) {
            if(err) throw err;
            console.log(res);
        });
    });
});
*/      
            
self.addEventListener('message', function(e) {
    var data = e.data;
    
    console.log('incoming data');
    console.log(e.data);
    
    switch (data.command) {

        case 'saveSession':
            
            r.table('sessions').insert(data.sessionObject).run(connection, function(err, result) {
                if (err) {throw err;}
                console.log(JSON.stringify(result, null, 2));
            });
            
            break;
            
        case 'saveState':
            
            r.table('sessions').get(data.session)('states').
                append({timestamp: Date.now(), hash: data.hash}).run(connection, function(err, result) {
                    if (err) {throw err;}
                    console.log(JSON.stringify(result, null, 2));
                });
            
            r.table('states').insert({id: data.hash, state: data.state}).run(connection, function(err, result) {
                if (err) {throw err;}
                console.log(JSON.stringify(result, null, 2));
            });
            
            break;
         
        default:
            console.log('[Webworker] unknown command ' + data.command);
        //    self.postMessage('Unknown command: ' + data.msg);
    
    }
}, false);