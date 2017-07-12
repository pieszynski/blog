/*
    Instrukcja użycia
    =================

    Biblioteka generująca spis treści (eng. toc).


    .createToc(body)
    ======================
    Metoda znajduje pierwszy tag <h3> i przed niego wstawia spis treści.

    Metoda wyszukuje wszystkie tagi <h3>...</h3> i przed nie wstawia 
    tagi <a id=""></a> gdzie ID jest generowane na podstawie tytułu.

    Dlatego najlepiej jest jeśli tag <h3/> znajduje się zaraz na początku
    dokumentu - inaczej spis treści będzie w środku pliku.

*/
(function(undefined) {
    "use strict";

    var regH3 = /<h3[^>]*>((.|[\r\n])*?)<\/h3>/i;

    var TOC_NAME = "Spis treści";

    function toAnchroId (text) {
        var response = text.replace(/<[^>]*>|[^a-z0-9]+|\r|\n/gi, '');
        return response;
    }

    function createToc (body) {

        var data = body;
        var response = '';
        var m;

        var firstH3 = undefined;
        var tocs = [];

        while (m = regH3.exec(data)) {
            var prevData = data.substr(0, m.index);
            var anchHtml = m[1];
            var anchId = toAnchroId(anchHtml);

            if (undefined === firstH3) {
                firstH3 = prevData || '';
                prevData = '';
            }

            tocs.push({ id:anchId, html:anchHtml });

            response += prevData 
                + '<a id="' + anchId + '"></a>\r\n'
                + m[0];
            data = data.substr(m.index + m[0].length);
        }

        if (data)
            response += data;

        var tocHtml = '<h3>' + TOC_NAME + '</h3><ol class="toc">' + tocs.map(function _tocMap(el) {
            return '<li><a href="#' + el.id + '">' + el.html + '</a></li>';
        }).join('') + '</ol>';

        var responseHtml = firstH3 
            + tocHtml
            + '\r\n'
            + response;

        return responseHtml;
    }

    module.exports = {
        createToc : createToc
    };
})();