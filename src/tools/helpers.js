var fs = require('fs'),
    path = require('path'),
    process = require('process');

var hljs = require('./highlight.min.js');
var pg = require('./percentage.js');

// HLJS Langs (hljs.listLanguages()): 'apache','bash','coffeescript','cpp','cs','css','diff','http','ini','java','javascript','json','makefile','xml','markdown','nginx','objectivec','perl','php','python','ruby','sql'

(function(fs, path, process, pg, hljs, undefined) {
    "use strict"; 

    __dirname = process.cwd();

    var StandardTemplateReplacements = {
        title: '',
        gohome: true,
        name: '',
        tagline: '',
        body: ''
    }

    var StandardTopicReplacements = {
        code: function(k,v) {
            var result = hljs.highlightAuto(v.trim());
            return '<pre><code class="hljs ' + result.language + '">' + result.value + '</code></pre>';
        },
        code_cs: function(k,v) {
            var result = hljs.highlight('cs', v.trim());
            return '<pre><code class="hljs cs">' + result.value + '</code></pre>';
        },
        code_bash: function(k,v) {
            var result = hljs.highlight('bash', v.trim());
            return '<pre><code class="hljs bash">' + result.value + '</code></pre>';
        }
    }

    // szablony dokumentów
    // ===================

    function getTemplate(filePath) {

        var templateText = fs.readFileSync(filePath, 'utf-8'),
            template = pg.compile(templateText);

        return template;
    }

    function renderTemplate(template, replacements, dst) {
        if (!path.isAbsolute(dst)) {
            dst = path.normalize(path.join(__dirname, dst));
        }
        var content = template(replacements);
        fs.createWriteStream(dst, 'utf-8').end(content);
    }

    function renderTopics(template, pages) {
        mkDir(path.normalize(path.join(pages.output, pages.pagesRoute)));

        StandardTemplateReplacements.title = pages.title;
        StandardTemplateReplacements.gohome = true;

        pages.pages.forEach(function(elem) {
            var srcRelPage = path.normalize(path.join(pages.pagesPath, elem.name + '.html'));
            var dstTopic = path.normalize(path.join(pages.output, pages.pagesRoute, elem.name + '.html'));
            var elemTemplate = getTemplate(srcRelPage);

            StandardTemplateReplacements.body = elemTemplate(StandardTopicReplacements);
            StandardTemplateReplacements.name = elem.title;
            StandardTemplateReplacements.tagline = elem.description;
            console.log('rendering', elem.name, 'to', dstTopic);
            renderTemplate(
                template, 
                StandardTemplateReplacements, 
                dstTopic
                )
        });
    }

    function renderIndex(template, pages) {
        var dst = path.normalize(path.join(pages.output, 'index.html'));

        var body = pages.pages.map(function(elem) {
            return '<a href="' + pages.pagesRoute + '/' + elem.name + '" class="topic-link">'
                + '<div><h1>' + elem.title + '</h1>'
                + '<p>' + elem.description + '</p></div>'
                + '</a>'
        }).join('\r\n');

        StandardTemplateReplacements.title = pages.title;
        StandardTemplateReplacements.gohome = false;
        StandardTemplateReplacements.name = pages.name;
        StandardTemplateReplacements.tagline = pages.description;
        StandardTemplateReplacements.body = body;
        console.log('rendering root to', dst);
        renderTemplate(
            template, 
            StandardTemplateReplacements, 
            dst
            )
    }

    // operacje plikowe
    // ================

    function readDirAll(dir, recurse, relDir) {
        
        relDir = relDir || '';
        if (!path.isAbsolute(dir)) {
            dir = path.resolve(__dirname, dir);
        }

        var response = fs.readdirSync(dir)
            .map(function (elem) {
                var fullPath = path.resolve(dir, elem);
                var stat = fs.statSync(fullPath);
                return { 
                    name: elem, 
                    path: fullPath, 
                    relPath: path.join(relDir, elem),
                    relDir: relDir,
                    isDir: stat.isDirectory() 
                };
            });
        
        if (recurse) {
            response.filter(function(elem) { return elem.isDir; })
                .forEach(function(elem) {
                    var subResponse = readDirAll(elem.path, true, elem.relPath);
                    response = response.concat(subResponse);
                });
        }

        return response;
    }

    function mkDir(dir) {
        var elements = path.normalize(dir).split(path.sep);
        var prev = __dirname;
        for (var i = 0; i < elements.length; i++) {
            var elem = elements[i];
            prev = path.normalize(path.join(prev, elem));
            try {
                fs.statSync(prev)
            } catch (ex) {
                console.log('mkdir', prev);
                fs.mkdirSync(prev);
            }
        }
    }

    function copyFile(src, dst) {
        if (!path.isAbsolute(src))
            src = path.resolve(__dirname, src);
        if (!path.isAbsolute(dst))
            dst = path.resolve(__dirname, dst);
        fs.createReadStream(src).pipe(fs.createWriteStream(dst));
    }

    function copyDir(src, dst) {
        var allFiles = readDirAll(src, true)
            .filter(function(elem) { return !elem.isDir; })
            .forEach(function(elem) {
                var from = elem.path;
                var to = path.join(__dirname, dst, elem.relPath);
                var toDir = path.normalize(path.join(dst, elem.relDir));
                mkDir(toDir);
                console.log('copy', from, to);
                copyFile(from, to);
            });
    }

    module.exports = {
        getTemplate: getTemplate,
        renderIndex: renderIndex,
        renderTopics: renderTopics,

        copyDir: copyDir,
        copyFile: copyFile,
        mkDir: mkDir,
        readDirAll: readDirAll
    };
})(fs, path, process, pg, hljs);