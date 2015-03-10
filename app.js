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
    var fs = require('fs'),
        stylPath = req.originalUrl.replace(/(\d{1,}|\w{1,}|_{1,})\.css$/i, '$1' + '.styl'), data;

    data = fs.readFileSync(__dirname + app.get('staticPath') + stylPath, { encoding: 'utf8' }, function(err, data){
        if (err) throw err;
    });
    stylus(data).render(function(err, css){
            if (err) throw err;
            fs.writeFileSync(__dirname + app.get('staticPath') + req.originalUrl, css);
    });
    next();
})

//static url
app.use(express.static(__dirname + app.get('staticPath')));

server = app.listen(3000, function () {
    console.log('Server is running at port ' + server.address().port);
})
