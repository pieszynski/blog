var fs = require('fs'),
    path = require('path'),
    process = require('process');

var hljs = require('./highlight.min.js');
var pg = require('./percentage.js');
var tocer = require('./tocer.js');
var searchGen = require('./searchGen.js');

// HLJS Langs (hljs.listLanguages()): 'apache','bash','coffeescript','cpp','cs','css','diff','http','ini','java','javascript','json','makefile','xml','markdown','nginx','objectivec','perl','php','python','ruby','sql'

(function(fs, path, process, pg, hljs, tocer, searchGen, undefined) {
    "use strict"; 

    __dirname = process.cwd();

    var RssPreamble = '<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>@pieszynski.com</title><link>http://pieszynski.com/</link><description>Co nowego na stronie pieszynski.com</description><atom:link href="http://pieszynski.com/feed.rss" rel="self" type="application/rss+xml" />\r\n',
        RssTail = '\r\n</channel></rss>';

    var StandardTemplateReplacements = {
        title: '',
        gohome: true,
        name: '',
        tagline: '',
        body: '',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: ''
    }

    var StandardTopicReplacements = {
        ref_topic: function (k,v){},
        code: function(k,v) {
            var result = hljs.highlightAuto(v.trim());
            return '<pre><code class="hljs ' + result.language + '">' + result.value + '</code></pre>';
        },
        code_cs: function(k,v) {
            var result = hljs.highlight('cs', v.trim());
            return '<pre><code class="hljs cs">' + result.value + '</code></pre>';
        },
        code_js: function(k,v) {
            var result = hljs.highlight('javascript', v.trim());
            return '<pre><code class="hljs javascript">' + result.value + '</code></pre>';
        },
        code_java: function(k,v) {
            var result = hljs.highlight('java', v.trim());
            return '<pre><code class="hljs java">' + result.value + '</code></pre>';
        },
        code_ts: function(k,v) {
            var result = hljs.highlight('javascript', v.trim());
            return '<pre><code class="hljs javascript">' + result.value + '</code></pre>';
        },
        code_bash: function(k,v) {
            var result = hljs.highlight('bash', v.trim());
            return '<pre><code class="hljs bash">' + result.value + '</code></pre>';
        },
        code_json: function(k,v) {
            var result = hljs.highlight('json', v.trim());
            return '<pre><code class="hljs json">' + result.value + '</code></pre>';
        },
        code_python: function(k,v) {
            var result = hljs.highlight('python', v.trim());
            return '<pre><code class="hljs python">' + result.value + '</code></pre>';
        }
    }

    // szablony dokumentów
    // ===================

    function getRawPage(filePath) {

        var rawText = fs.readFileSync(filePath, 'utf-8');

        return rawText;
    }

    function getTemplate(filePath) {

        var templateText = getRawPage(filePath),
            template = pg.compile(templateText);

        return template;
    }

    function getTopicUrl(pages, elem) {
        return '/' + pages.pagesRoute + '/' + elem.name;
    }

    function buildRefTopicFn(pages) {
        return function _refTopic(k,v) {
            var page = pages.pages.filter(function _refTopicFilter(el) {
                return el.name === v;
            }).pop();
            if (!page)
                throw 'Nieznana referencja: ' + (v || '');
            return '<a href="' + getTopicUrl(pages, page) + '">' + page.title + '</a>';
        };
    }

    function renderTemplate(template, replacements, dst) {
        var content = template(replacements);
        writeContentTo(dst, content);
    }

    function renderTopics(template, pages) {
        mkDir(path.normalize(path.join(pages.output, pages.pagesRoute)));

        StandardTemplateReplacements.title = pages.title;
        StandardTemplateReplacements.gohome = true;
        StandardTemplateReplacements.twitterImage = pages.domain + pages.twitterDefaultImage;

        StandardTopicReplacements.ref_topic = buildRefTopicFn(pages);

        pages.pages.forEach(function(elem) {
            var srcRelPage = path.normalize(path.join(pages.pagesPath, elem.name + '.html'));
            var dstTopic = path.normalize(path.join(pages.output, pages.pagesRoute, elem.name + '.html'));
            var elemTemplate = getTemplate(srcRelPage);

            console.log('rendering', elem.name, 'to', dstTopic);
            var rawBody = elemTemplate(StandardTopicReplacements);

            console.log('creating search index for', elem.name);
            var pageIndex = searchGen.createIndex(getRawPage(srcRelPage));

            StandardTemplateReplacements.body = tocer.createToc(rawBody);
            StandardTemplateReplacements.name = elem.title;
            StandardTemplateReplacements.tagline = elem.description;
            StandardTemplateReplacements.twitterTitle = elem.title;
            StandardTemplateReplacements.twitterDescription = elem.description;
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
            return '<a href="' + getTopicUrl(pages, elem) + '" class="topic-link">'
                + '<div><h1>' + elem.title + '</h1>'
                + '<p>' + elem.description + '</p><div class="hv-anim"></div></div>'
                + '</a>'
        }).join('\r\n');

        StandardTemplateReplacements.title = pages.title;
        StandardTemplateReplacements.gohome = false;
        StandardTemplateReplacements.name = pages.name;
        StandardTemplateReplacements.tagline = pages.description;
        StandardTemplateReplacements.body = body;
        
        StandardTemplateReplacements.twitterTitle = pages.title;
        StandardTemplateReplacements.twitterDescription = pages.description;
        StandardTemplateReplacements.twitterImage = pages.domain + pages.twitterDefaultImage;

        console.log('rendering root to', dst);
        renderTemplate(
            template, 
            StandardTemplateReplacements, 
            dst
            )

        // wygenerowanie RSSa
        createRss(pages)
    }

    // generowanie RSS
    // ===============

    function createRss(pages) {

        var html = '<ul>\r\n',
            rss = RssPreamble;

        for(var i = 0; i < pages.pages.length; i++) {

            var p = pages.pages[i];

            var tUrl = pages.domain + getTopicUrl(pages, p)

            // HTML
            html += '<li><a href="';
            html += tUrl;
            html += '">';
            html += p.title;
            html += '</a></li>\r\n';

            // RSS
            rss += '<item><title>';
            rss += p.title;
            rss += '</title><description>';
            rss += p.description;
            rss += '</description><link>';
            rss += tUrl;
            rss += '</link><guid>';
            rss += tUrl;
            rss += '</guid><pubDate>';
            rss += (new Date(p.date)).toUTCString();
            rss += '</pubDate></item>\r\n';
        }

        html += '</ul>';
        rss += RssTail;

        var dst = path.normalize(path.join(pages.output, 'feed.rss'));
        console.log('rendering RSS to', dst);
        writeContentTo(dst, rss);
    }

    // operacje plikowe
    // ================

    function writeContentTo(dst, content) {
        if (!path.isAbsolute(dst)) {
            dst = path.normalize(path.join(__dirname, dst));
        }
        fs.createWriteStream(dst, 'utf-8').end(content);
    }

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
})(fs, path, process, pg, hljs, tocer, searchGen);