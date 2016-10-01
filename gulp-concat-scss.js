'use strict';

var gutil = require('gulp-util');
var pathHelper = require('path');
var through = require('through2');
var parseImport = require('parse-import');
var helper = require('./gulp-helper.js')();
var mergedScss = "";
var imported = [];

module.exports = function (destFile, options) {
    var firstFile;

    return through.obj(function (file, enc, cb) {

        if (!firstFile) {
            firstFile = file;
        }

        var filePath = file.history[0];
        mergedScss = getScssContentWithImports(filePath, options);

        var includeStatements = "";
        imported.forEach(function (item) {
            includeStatements = includeStatements.concat(item.rule + ";\r\n");
        });
        mergedScss = includeStatements + mergedScss;

        cb();
    },
        function cb() {

            var concatenatedFile = new gutil.File({
                base: firstFile.base,
                cwd: firstFile.cwd,
                path: pathHelper.join(firstFile.base, destFile),
                contents: new Buffer(mergedScss, 'utf-8')
            });
            this.push(concatenatedFile);
        });
};

function getImportFileName(importName) {
    if (helper.strEndsWith(importName, '.scss')) {
        return importName;
    }
    return '_' + importName + '.scss';
}

function underscoreAdjustedPath(folder, filename) {
    var path = folder + filename;

    try {
        helper.readContent(path);
    }
    catch (e) {
        filename = filename.substr(1);
        return underscoreAdjustedPath(folder, filename);
    }
    return folder + filename;
}

function getImportFilePath(baseDir, importPath) {

    var folderPath, fileName;

    importPath = helper.replaceAll(importPath, '/', '\\');
    var path = baseDir + '\\' + importPath;

    var index = path.lastIndexOf('\\');
    if (index > -1) {
        folderPath = path.substr(0, index + 1);
        fileName = getImportFileName(path.substr(index + 1));
    }
    else {
        folderPath = "";
        fileName = getImportFileName(path);
    }

    return underscoreAdjustedPath(folderPath, fileName);
}

function getScssContentWithImports(scssPath, options) {

    var content = helper.readContent(scssPath);
    var importData = parseImport(content);

    // remove @import statements
    content = helper.deleteLines(content, {
        'filters': [
            /@import\s/i
        ]
    });

    for (var i = importData.length - 1; i >= 0; i--) {

        // save imports of files that are excluded from concatenation
        if (helper.contains(options.exclude, importData[i].path)) {
            imported.push(importData[i]);
            continue;
        }

        var baseDir = scssPath.substr(0, scssPath.lastIndexOf('\\'));
        // tedious work to get the path from the import statement
        var importAbsolutePath = getImportFilePath(baseDir, importData[i].path);
        content = getScssContentWithImports(importAbsolutePath, options) + content;
    }

    return content + '\r\n';
}

