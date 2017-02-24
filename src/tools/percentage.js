(function() {
    "use strict"
    var BEGIN='%%%#';
    var END='#%%%'
    var BEGIN_LENGTH=BEGIN.length;
    var END_LENGTH=END.length;

    function search(text) {

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

    module.exports = search;
})();