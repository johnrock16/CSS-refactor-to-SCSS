const fs = require('fs');
const {sortAttributes, Navigate} = require('./utils');
const {generateColors} = require('./colors');
const { CSSToObject } = require('./CSSToObject');

//insert the file path you want to change and the fle path to colors path
const FILEPATH = './css/style.css';
const COLORSPATH = './css/colors.scss';
const navigate = Navigate();

let newFIlePath = FILEPATH.split('/');
newFIlePath[newFIlePath.length - 1] = `new_${newFIlePath[newFIlePath.length - 1].replace('css','scss')}`;
newFIlePath = newFIlePath.join('/');


fs.readFile(COLORSPATH, 'utf8', (err, colors) => {
    if(err) {
        console.log(err);
        return;
    }
    let colorsFormated = generateColors(colors);

    fs.readFile(FILEPATH, 'utf8', async (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        let lines = data.split('\n');
        let selectorObj = CSSToObject(lines, colorsFormated);

        navigate.navigateIndex(selectorObj);
        selectorObj = sortAttributes(selectorObj);

        navigate.navigateObject(selectorObj)
        let arrayPush = navigate.arrayPush();

        fs.unlink(newFIlePath, function (err) {});

        fs.appendFile(newFIlePath, arrayPush.join('\n'), function (err) {
            if (err) throw err;
        });
    });
});