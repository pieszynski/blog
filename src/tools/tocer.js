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

    var regH3 = /<h(3|4)[^>]*>((.|[\r\n])*?)<\/h\d>/i;

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
            var anchHtml = m[2];
            var anchId = toAnchroId(anchHtml);

            if (undefined === firstH3) {
                firstH3 = prevData || '';
                prevData = '';
            }

            tocs.push({ id:anchId, html:anchHtml, lvl: ((+m[1])-3) });

            response += prevData 
                + '<a id="' + anchId + '"></a>\r\n'
                + m[0];
            data = data.substr(m.index + m[0].length);
        }

        if (data)
            response += data;

        // STARE
        //  var tocHtml = '<h3>' + TOC_NAME + '</h3><ol class="toc">' + tocs.map(function _tocMap(el) {
        //      return '<li><a href="#' + el.id + '">' + el.html + '</a></li>';
        //  }).join('') + '</ol>';

        var tocHtml = '<h3>' + TOC_NAME + '</h3><ol class="toc">';
        var ptslState = undefined;
        for (var ti = 0; ti < tocs.length; ti++) {
            var el = tocs[ti];
            tocHtml += '<li><a href="#' + el.id + '">' + el.html + '</a>';
            ptslState = printTocSubLevels(tocHtml, tocs, ti, el.lvl);
            if (ptslState) {
                ti = ptslState.ti;
                tocHtml = ptslState.tocHtml;
            }
            tocHtml += '</li>';
        }
        tocHtml += '</ol>';

        var responseHtml = firstH3 
            + tocHtml
            + '\r\n'
            + response;

        return responseHtml;
    }

    function printTocSubLevels(tocHtml, tocs, ti, lvl) {
        if (ti + 1 >= tocs.length)
            return undefined;

        var elFirst = tocs[ti + 1];
        var el = elFirst;
        var ptslState = undefined;

        if (lvl >= elFirst.lvl)
            return undefined;

        tocHtml += '<ol class="toc-sub'+elFirst.lvl+'">';
        while (ti++ && ti < tocs.length) {
            el = tocs[ti];
            if (elFirst.lvl !== el.lvl)
                break;

            tocHtml += '<li><a href="#' + el.id + '">' + el.html + '</a>';
            ptslState = printTocSubLevels(tocHtml, tocs, ti, el.lvl);
            if (ptslState) {
                ti = ptslState.ti;
                tocHtml = ptslState.tocHtml;
            }
            tocHtml += '</li>';
        }
        tocHtml += '</ol>';
        
        return { ti: ti-1, tocHtml: tocHtml };
    }

    module.exports = {
        createToc : createToc
    };
})();