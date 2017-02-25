var helpers = require('./tools/helpers.js'),
    pages = require('./pages.json');

// przekopiowanie treści statycznych

helpers.copyDir(pages.static, pages.output);

// odczytanie pliku szablonu i przygotowanie do podmian

var template = helpers.getTemplate(pages.layout);

helpers.renderIndex(template, pages);
helpers.renderTopics(template, pages);


//console.log(newFile)