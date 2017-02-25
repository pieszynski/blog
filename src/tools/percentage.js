(function() {
    "use strict"
    var BEGIN='%%%#';
    var END='#%%%'
    var BEGIN_LENGTH=BEGIN.length;
    var END_LENGTH=END.length;

    function search(text) {

        // text: 'ala %%%#body_#%%% kota w %%%#siersc_kropki#%%%'
        //
        // @result: 
        //  [ { b: 25, e: 45, t: 'siersc', bin: 36, ein: 41 },
        //    { b: 17, e: 24, t: 'text', bin: 17, ein: 24 },
        //    { b: 4, e: 16, t: 'body', bin: 13, ein: 13 },
        //    { b: 0, e: 3, t: 'text', bin: 0, ein: 3 } ]

        var response = [];
        var pos = 0;
        var len = text.length;
        var idx;
        var idx_begin, idx_end;
        var idx_begin_mod = 0;
        var type = 'text';
        var temp = '';
        var seg = undefined;

        while (pos < len) {
            idx = text.indexOf(BEGIN, pos)
            if (-1 === idx) {
                response.unshift({b:pos, e:text.length-1, t:'text', bin:pos, ein:text.length-1});
                break;
            } else {
                idx_begin = idx;
                idx = text.indexOf(END, idx_begin+BEGIN_LENGTH);
                idx_end = idx;
                if (-1 === idx_end) {
                    response.unshift({b:pos, e:text.length-1, t:'text', bin:pos, ein:text.length-1});
                } else {
                    if (idx > pos) {
                        response.unshift({b:pos, e:idx_begin-1, t:'text', bin:pos, ein:idx_begin-1});
                    }
                    pos = idx_end+END_LENGTH;
                    type = 'template'
                    idx_begin_mod = 0;
                    // poszukiwanie pierwszego podkreślnika od BEGIN - określnik typu
                    idx = text.indexOf('_', idx_begin+BEGIN_LENGTH);
                    if (idx < idx_end) {
                        temp = text.substring(idx_begin+BEGIN_LENGTH, idx);
                        if (-1 === temp.indexOf(' ')) {
                            type = temp;
                            idx_begin_mod = idx - (idx_begin+BEGIN_LENGTH) + 1;
                        }
                    }
                    seg = {b:idx_begin, e:idx_end+END_LENGTH-1, t:type, bin:idx_begin+BEGIN_LENGTH+idx_begin_mod, ein:idx_end-1};
                    if (seg.ein < seg.bin) {
                        seg.ein = seg.bin;
                    }
                    response.unshift(seg);
                }
            }
        }
        return response;
    }

    function compile(text, layout) {

        // text: 'ala %%%#body_#%%% kota w %%%#siersc_kropki#%%%'
        // layout:
        //  [ { b: 25, e: 45, t: 'siersc', bin: 36, ein: 41 },
        //    { b: 17, e: 24, t: 'text', bin: 17, ein: 24 },
        //    { b: 4, e: 16, t: 'body', bin: 13, ein: 13 },
        //    { b: 0, e: 3, t: 'text', bin: 0, ein: 3 } ]
        //
        // @result: (replacements) => {...}

        if (!layout)
            layout = search(text);

        var data = [];

        for (var i = 0; i < layout.length; i++) {
            var elem = layout[i];
            if (elem.b < elem.e) {
                data.unshift({ 
                    k: elem.t, 
                    v: (elem.bin < elem.ein ? text.substring(elem.bin, elem.ein+1) : '')
                });
            }
        }

        return function __replace(replacements) {

            // replacements { body: 'ma', siersc: (k,v) => v + ' i kreski' }
            //
            // @result:
            //  ala ma kota w kropki i kreski

            var response = data.map(function __data_map(elem) {

                if ('text' === elem.k) {
                    return elem.v;
                } else {
                    var repl = replacements[elem.k];
                    if ('function' === typeof(repl)) {
                        return repl(elem.k, elem.v);
                    } else {
                        return repl;
                    }
                }
            }).join('');

            return response;
        };
    }

    module.exports = {
        search: search,
        compile: compile
    };
})();