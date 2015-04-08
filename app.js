var express = require('express'),
    app  = express(),
    swig = require('swig'),
    router = require(__dirname + '/config/routes')(express),
    stylus = require('stylus'),
    Vow = require('vow'),
    VM = require('vm'),
    fs = require('fs'),
    markdown = require('marked'),
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
app.use('/desktop.bundles', express.static(__dirname + '/desktop.bundles'));
app.use('/desktop.examples', express.static(__dirname + '/desktop.examples'));

app.get('/documentation/:block', function(req, res){
    var BEMHTML = require('./desktop.bundles/index/index.bemhtml.js').BEMHTML,
        menu = require('./lib/menu'),
        bemtree = fs.readFileSync('./desktop.bundles/index/index.bemtree.js', 'utf-8'),
        readmeContent = '', stats,
        pageExists = false;

    if(req.params.block){
        fs.readdirSync('./desktop.blocks').forEach(function(value){
            if(value == req.params.block) {
                pageExists = true;

                try {
                    stats = fs.lstatSync('./desktop.blocks/' + value + '/' + value + '.md');

                    if (stats.isFile()) {
                        var renderer = new markdown.Renderer();
                        renderer.code = function (code, language) {
                            var html = '';
                            html += '<pre style="color: red;">' + code + '</pre>';
                            html += '<iframe style="border: 1px solid #E6E6E6; min-height: 50px; width: 100%; height: 68px;" src="/desktop.examples/b-input/_Wo7NZpCcX1KOf-xLHFYtm_vgRY/_Wo7NZpCcX1KOf-xLHFYtm_vgRY.html"></iframe>'
                            return html;
                        }
                        readmeContent = markdown(fs.readFileSync('./desktop.blocks/' + value + '/' + value + '.md', 'utf-8'), { renderer: renderer });
                    } else {
                        readmeContent = false;
                    }
                }catch(e){
                    readmeContent = false;
                }

                var context = VM.createContext({
                    console: console,
                    Vow: Vow
                });

                VM.runInContext(bemtree, context);
                BEMTREE = context.BEMTREE;
                BEMTREE.apply({
                    block: 'root',
                    data: {dir: '/desktop.bundles/index', menu: menu('/desktop.blocks', req), readme: readmeContent}
                }).then(function (json) {
                    //res.send('<pre>' + JSON.stringify(json, null, 4) + '</pre>');
                    res.send(BEMHTML.apply(json));
                })

            }
        });

        if(!pageExists){
            res.send('page dont exists');
        }
    }

});


server = app.listen(3000, function () {
    console.log('Server is running at port ' + server.address().port);
});
