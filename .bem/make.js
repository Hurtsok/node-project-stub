var techs = {
        // essential
        fileProvider: require('enb/techs/file-provider'),
        fileMerge: require('enb/techs/file-merge'),

        // optimization
        borschik: require('enb-borschik/techs/borschik'),

        // css
        cssStylus: require('enb-stylus/techs/css-stylus'),
        cssAutoprefixer: require('enb-autoprefixer/techs/css-autoprefixer'),

        // js
        browserJs: require('enb-diverse-js/techs/browser-js'),
        prependYm: require('enb-modules/techs/prepend-modules'),
        js: require('enb/techs/js'),

        // bemtree
        bemtree: require('enb-bemxjst/techs/bemtree-old'),

        // bemhtml
        bemhtml: require('enb-bemxjst/techs/bemhtml-old'),

        //html
        html: require('enb-bemxjst/techs/html-from-bemjson')
    },
    enbBemTechs = require('enb-bem-techs'),
    levels = [
        { path: 'bower_components/bem-core/common.blocks', check: false },
        { path: 'bower_components/bem-core/desktop.blocks', check: false },
        { path: 'bower_components/bem-components/common.blocks', check: false },
        { path: 'bower_components/bem-components/desktop.blocks', check: false },
        { path: 'bower_components/bem-components/design/common.blocks', check: false },
        { path: 'bower_components/bem-components/design/desktop.blocks', check: false },
        'common.blocks',
        'desktop.blocks'
    ],
    path = require('path'),
    naming = require('bem-naming');

module.exports = function(config) {
    var isProd = process.env.YENV === 'production';

    config.includeConfig('enb-bem-examples');

    var examples = config.module('enb-bem-examples').createConfigurator('examples');

    examples.configure({
        destPath: 'desktop.examples',
        levels: ['desktop.blocks'],
        inlineBemjson: true,
        processInlineBemjson: function(bemjson, meta){
            var basename = path.basename(meta.filename, '.bemjson.js');
            return {
                block: 'page',
                attrs: { style: 'display: block' },
                head: [
                    { elem: 'js', url: '/desktop.examples/' +  naming.stringify(bemjson) + '/' + basename + '/' + basename + '.js' },
                    { elem: 'css', url: '/desktop.examples/' + naming.stringify(bemjson) + '/' +  basename + '/' + basename + '.css' }
                ],
                content: bemjson
            }
        }
    });

    config.nodes('*.bundles/*', function(nodeConfig) {
        nodeConfig.addTechs([
            // essential
            [enbBemTechs.levels, { levels: levels }],
            [techs.fileProvider, { target: '?.bemdecl.js' }],
            [enbBemTechs.deps],
            [enbBemTechs.files],

            // css
            [techs.cssStylus, { target: '?.noprefix.css' }],
            [techs.cssAutoprefixer, {
                sourceTarget: '?.noprefix.css',
                destTarget: '?.css',
                browserSupport: ['last 2 versions', 'ie 10', 'opera 12.16']
            }],

            // bemtree
            [techs.bemtree, { devMode: process.env.BEMTREE_ENV === 'development', sourceSuffixes: ['bemtree', 'bemtree.js'] }],

            // bemhtml
            [techs.bemhtml, { devMode: process.env.BEMHTML_ENV === 'development', sourceSuffixes: ['bemhtml', 'bemhtml.js'] }],

            [require('./techs/bemtreeToHtml')],

            // client bemhtml
            [enbBemTechs.depsByTechToBemdecl, {
                target: '?.bemhtml.bemdecl.js',
                sourceTech: 'js',
                destTech: 'bemhtml'
            }],
            [enbBemTechs.deps, {
                target: '?.bemhtml.deps.js',
                bemdeclFile: '?.bemhtml.bemdecl.js'
            }],
            [enbBemTechs.files, {
                depsFile: '?.bemhtml.deps.js',
                filesTarget: '?.bemhtml.files',
                dirsTarget: '?.bemhtml.dirs'
            }],
            [techs.bemhtml, {
                target: '?.browser.bemhtml.js',
                filesTarget: '?.bemhtml.files',
                devMode: process.env.BEMHTML_ENV === 'development'
            }],

            // js
            [techs.browserJs],
            [techs.fileMerge, {
                target: '?.pre.js',
                sources: ['?.browser.bemhtml.js', '?.browser.js']
            }],
            [techs.prependYm, { source: '?.pre.js' }],

            // borschik
            [techs.borschik, { sourceTarget: '?.js', destTarget: '_?.js', freeze: true, minify: isProd }],
            [techs.borschik, { sourceTarget: '?.css', destTarget: '_?.css', tech: 'cleancss', freeze: true, minify: isProd }]
        ]);

        nodeConfig.addTargets(['?.bemtree.js', '?.html', '_?.css', '_?.js']);
    });

    config.nodes('*.examples/*/*', function(nodeConfig){
        nodeConfig.addTechs([
            [enbBemTechs.levels, { levels: levels }],

            [enbBemTechs.bemjsonToBemdecl],
            [enbBemTechs.deps],
            [enbBemTechs.files],
            [techs.js, {sourceSuffixes: ['vanilla.js', 'browser.js', 'js'] }],

            //html
            [techs.html],

            //bemhtml
            [techs.bemhtml, { devMode: process.env.BEMHTML_ENV === 'development', sourceSuffixes: ['bemhtml', 'bemhtml.js'] }],

            //css
            [techs.cssStylus, { target: '?.noprefix.css' }],
            [techs.cssAutoprefixer, {
                sourceTarget: '?.noprefix.css',
                destTarget: '?.css',
                browserSupport: ['last 2 versions', 'ie 10', 'opera 12.16']
            }],

            // borschik
            [techs.borschik, { sourceTarget: '?.js', destTarget: '_?.js', freeze: true, minify: isProd }],
            [techs.borschik, { sourceTarget: '?.css', destTarget: '_?.css', tech: 'cleancss', freeze: true, minify: isProd }]
        ]);

        nodeConfig.addTargets(['_?.css', '_?.js', '?.html']);
    })

};