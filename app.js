var express = require('express'),
    app  = express(),
    swig = require('swig'),
    router = require(__dirname + '/config/routes')(express),
    stylus = require('stylus'),
    server;


//register template engine
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

app.set('staticPath', '/static');
app.use(router);

app.use('/css', function(req, res, next){
    var str = require('fs').readFileSync(__dirname + app.get('staticPath') + req.originalUrl, 'utf8');
    next();
})

//static url
app.use(express.static(__dirname + app.get('staticPath')));

server = app.listen(3000, function () {
    console.log('Server is running at port ' + server.address().port);
})
