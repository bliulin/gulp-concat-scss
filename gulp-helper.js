'use strict';

var fs = require('fs');

module.exports = function () {
    var util = {
        contains: function (array, obj) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].toString().indexOf(obj.toString()) !== -1) {
                    return true;
                }
            }
            return false;
        },

        deleteLines: function (str, opt) {
            var newLines = [];
            var lines = str.split(/\r\n|\r|\n/g);

            for (var _i = 0; _i < lines.length; _i++) {

                for (var _j = 0; _j < opt.filters.length; _j++) {
                    if (!lines[_i].match(opt.filters[_j])) {
                        newLines.push(lines[_i]);
                    }
                }
            }

            str = newLines.join('\n');
            return str;
        },

        strEndsWith: function (str, suffix) {
            return str.match(suffix + "$") == suffix;
        },

        replaceAll: function (input, search, replace) {
            return input.replace(new RegExp('[' + search + ']', 'g'), replace);
        },

        readContent: function (path) {
            return fs.readFileSync(path, { encoding: 'utf-8' });
        }
    };
    return util;
};