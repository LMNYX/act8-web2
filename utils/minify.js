/*-----*

minify.js
Summary: Scripts/Stylesheets minification

*-----*/
const path = require('path');
const minify = require('@node-minify/core');
const uglifyjs = require('@node-minify/uglify-es');
const cssnano = require('@node-minify/cssnano');
const { UtilBase } = require(`${__dirname}/base.js`);
__dirname = path.dirname(require.main.filename);

class Minify extends UtilBase
{
    GetFileExt (fileName)
    {
        let _fileName = fileName.split('.');
        return { "name": _fileName[0], "ext": _fileName[_fileName.length-1] };
    }

    GenerateMinifiedName (fileName)
    {
        let _sep = this.GetFileExt(fileName);
        return `${_sep.name}.min.${ _sep.ext}`;
    }

    GenerateMinification (ToMinify)
    {
        ToMinify.forEach((_file)=>
        {
            let _fileData = this.GetFileExt(_file);
            let _minName = this.GenerateMinifiedName(_file);
            switch(_fileData.ext)
            {
                case "js":
                    minify({
                        compressor: uglifyjs,
                        input: _file,
                        output: _minName,
                        callback: function (e, m){}
                    });
                    break;
                case "css":
                    minify({
                        compressor: cssnano,
                        input: _file,
                        output: _minName,
                        callback: function (e, m){}
                    });
                    break;
                default:
                    console.warn(`Impossible task: ${_file} can't be minified (unknown ext)`);
                    break;
            }
        });
        return;
    }
}

function ClassCreation(client)
{
    return new Minify(client);
}

module.exports = ClassCreation;