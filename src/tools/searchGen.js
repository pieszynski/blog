
(function(undefined) {
    "use strict";

    function createIndex(text) {

        var wordsInOrder = text
            .replace(/<(.*?|^|$|\n|\r)*?>/gmi, ' ')
            .replace(/[^a-ząężśźćńół]+/gmi, ' ')
            .trim()
            .split(' ')
            .filter(function (el) { return 2 < el.length; })
            .map(function (el) { return el.toLowerCase(); });

        var wordsIndex = wordsInOrder            
            .map(function (el, idx) { return { p: idx, v: el.toLowerCase() }; });

        var unqAcc = undefined;
        var uniqueWords = wordsInOrder
            .sort()
            .filter(function (el) {
                if (el !== unqAcc) {
                    unqAcc = el;
                    return true;
                }
                return false;
            })

        var response = {
            index: wordsIndex,
            words: uniqueWords
        };

        return response;
    }

    module.exports = {
        createIndex : createIndex
    };
})();