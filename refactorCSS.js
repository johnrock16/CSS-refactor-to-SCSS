const fs = require('fs');

//insert the file path you want to change and the fle path to colors path
const FILEPATH = './css/style.scss';
const COLORSPATH = './css/colors.scss'

let newFIlePath = FILEPATH.split('/');
newFIlePath[newFIlePath.length - 1] = `new_${newFIlePath[newFIlePath.length - 1]}`;
newFIlePath = newFIlePath.join('/');


const RULES = {
    attributes : {
        "font-size": {
            do: (attributeValue) => {
                let [attribute, ...value] = attributeValue.replace(';','').split(':');
                value = value[0].replace('px','').replace('em','').replace('rem','');

                let spaces = attribute.split('f');

                return `${spaces[0]}@include fontSize(${value/10}, ${value/10});`
            },
            method : "replaceAttribute"
        },
        "font-weight": {
            do: (attributeValue) => {
                let [attribute, ...value] = attributeValue.replace(';','').split(':');
                if (value[0] == 300) {
                    return `${attribute}: $light;`
                }
                if (value[0] == 400) {
                    return `REMOVE_ME`;
                }
                if (value[0] == 500) {
                    return `${attribute}: $semiBold;`
                }
                if (value[0] == 600) {
                    return `${attribute}: $semiBold;`
                }
                if (value[0] == 700) {
                    return `${attribute}: $bold;`
                }
            },
            find: "400",
            regex: /[4]/,
            method : "replaceAttribute"
        },
        "padding": {
            do: (attributeValue) => {
                let [attribute, ...values] = attributeValue.replace(';','').split(':');
                values = values[0].split(' ');
                values.forEach((value,index) => {
                    values[index] = value.replace('8px', '$gutter').replace('16px', '$gutter * 2').replace('24px', '$gutter * 3').replace('32px', '$gutter * 4').replace('40px', '$gutter * 5');
                })
                return `${attribute}:${values.join(' ')};`;
            },
            regexArray: [/[8]/,/[16]/,/[24]/,/[32]/,/[40]/],
            method : "gutterAttribute"
        },
        "margin": {
            do: (attributeValue) => {
                let [attribute, ...values] = attributeValue.replace(';','').split(':');
                values = values[0].split(' ');
                values.forEach((value,index) => {
                    values[index] = value.replace('8px', '$gutter').replace('16px', '$gutter * 2').replace('24px', '$gutter * 3').replace('32px', '$gutter * 4').replace('40px', '$gutter * 5');
                })
                return `${attribute}:${values.join(' ')};`;
            },
            regexArray: [/[8]/,/[16]/,/[24]/,/[32]/,/[40]/],
            method : "gutterAttribute"
        },
        "gap": {
            do: (attributeValue) => {
                let [attribute, ...values] = attributeValue.replace(';','').split(':');
                values = values[0].split(' ');
                values.forEach((value,index) => {
                    values[index] = value.replace('8px', '$gutter').replace('16px', '$gutter * 2').replace('24px', '$gutter * 3').replace('32px', '$gutter * 4').replace('40px', '$gutter * 5');
                })
                return `${attribute}:${values.join(' ')};`;
            },
            regexArray: [/[8]/,/[16]/,/[24]/,/[32]/,/[40]/],
            method : "gutterAttribute"
        },
        "color": {
            do: (attributeValue, colors) => {
                let [attribute, ...value] = attributeValue.replace(';','').split(':');
                value = value[0].trim();

                if(colors[value]){
                    return `${attribute}: ${colors[value]};`
                }
                return attributeValue;
            },
            method : "replaceColor"
        },
        "background-color": {
            do: (attributeValue, colors) => {
                let [attribute, ...value] = attributeValue.replace(';','').split(':');
                value = value[0].trim();

                if(colors[value]){
                    return `${attribute}: ${colors[value]};`
                }
                return attributeValue;
            },
            method : "replaceColor"
        },
        "border": {
            do: (attributeValue, colors) => {
                let [attribute, ...value] = attributeValue.replace(';','').split(':');
                value = value[0].split(' ');

                if(value[3] && colors[value[3]]){
                    return `${attribute}: ${value[1]} ${value[2]} ${colors[value[3]]};`
                }
                return attributeValue;
            },
            method : "replaceColor"
        },
        "border-color": {
            do: (attributeValue, colors) => {
                let [attribute, ...value] = attributeValue.replace(';','').split(':');
                value = value[0].trim();

                if(colors[value]){
                    return `${attribute}: ${colors[value]};`
                }
                return attributeValue;
            },
            method : "replaceColor"
        },
    }
}

const orders = ["position","top","left","bottom", "right","display","width","max-width","height","max-height","padding","margin","margin-top","margin-left","margin-bottom","margin-right","gap","font-size","color","background-color","border"]

const searchIndexAttribute = (line, regex) => {
    const index = line.search(regex)
    return {index, regex}
}

const findBranch = (selectorObj, selector) => {
    var hasSelectorParent = false
    Object.keys(selectorObj).forEach((selectorKey, index) => {
        if(selector.indexOf(selectorKey) > -1) {
            hasSelectorParent = true
        }
    });
    return hasSelectorParent
}

fs.readFile(COLORSPATH, 'utf8', (err, colors) => {
    if(err) {
        console.log(err);
        return;
    }
    let colorsFormated = {};

    colors.split('\n').forEach((color)=>{
        if(color && color.search(/[//]/) == -1){
            const [key,attribute] = color.split(':')
            colorsFormated = {...colorsFormated, [attribute.trim().replace(';','')]:key}
        }
    });

fs.readFile(FILEPATH, 'utf8', async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    let lines = data.split('\n');
    let selectors = [];
    let selectorObj = {};
    let storeKey = [];
    for(let i = 0;i < lines.length;i++){

        Object.keys(RULES.attributes).forEach((attribute)=> {
            if(lines[i].indexOf(attribute) > -1 && lines[i].search(/[//]/) == -1) {

                switch(RULES.attributes[attribute].method) {
                    case "replaceAttribute":
                        const replaceAttributes = RULES.attributes[attribute].do(lines[i]);

                        if(replaceAttributes === 'REMOVE_ME') {
                            lines.splice(i,1)
                        }

                        else if(replaceAttributes) {
                            lines[i] = replaceAttributes;
                        }
                        break;
                    case "replaceColor":
                        const replaceColor = RULES.attributes[attribute].do(lines[i],colorsFormated);

                        if(replaceColor) {
                            lines[i] = replaceColor;
                        }
                    break;
                    case "removeAttribute":
                        const removeData = searchIndexAttribute(lines[i], RULES.attributes[attribute].regex);
                        if(removeData.index > -1)
                            lines.splice(i,1)
                        break;
                    case "gutterAttribute":
                        const replaceGutter = RULES.attributes[attribute].do(lines[i]);
                        if(replaceGutter)
                            lines[i] = replaceGutter;
                        break;
                    default:
                        break;
                };
            }
        });

        if(lines[i].indexOf('{') > -1) {
            var selector = lines[i].replace('{', '').trim()

            if(selectors.indexOf(lines[i]) === -1){
                selectors.push(selector)
            }

            if(!selectorObj[selectorObj]) {
                Object.keys(selectorObj).forEach((selectorKey, index) => {
                    if (selector.indexOf(selectorKey) > -1) {

                        var hasAdded = false;

                        if(Object.keys(selectorObj[selectorKey]).length > 0) {
                            var hasSelectorParent = findBranch(selectorObj[selectorKey], selector)
                            if(!hasSelectorParent && selector.indexOf('__') > -1) {
                                if(selector.indexOf('>') > -1){
                                    var key = selector.split('__')[1].split('>')[0].trim();
                                    selectorObj[selectorKey][`&__${key}`][selector.split('__')[1].split('>')[1]] = {}
                                    hasAdded = true
                                    storeKey = []
                                    storeKey.push(selectorKey)
                                    storeKey.push(`&__${key}`)
                                    storeKey.push(`& >${selector.split('__')[1].split('>')[1]}`)
                                }
                                else if(selector.indexOf(':') > -1) {
                                    // console.log(selector)
                                    var key = selector.split('__')[1].split(':')[0];
                                    var countDots = selector.split(':').length -1;
                                    var key2 = selector.split('__')[1].split(':')[countDots];
                                    // console.log()
                                    selectorObj[selectorKey][`&__${key}`]['&'+':'.repeat(countDots)+key2]= {}
                                    hasAdded = true
                                    storeKey = []
                                    storeKey.push(selectorKey)
                                    storeKey.push(`&__${key}`)
                                    storeKey.push('&'+':'.repeat(countDots)+key2)
                                }
                                else if(selector.indexOf(' ') > -1) {
                                    var key = selector.split('__')[1].split(' ')[0]
                                    selectorObj[selectorKey][`&__${key}`][selector.split('__')[1].split(' ')[1]] = {}
                                    hasAdded = true
                                    storeKey = []
                                    storeKey.push(selectorKey)
                                    storeKey.push(`&__${key}`)
                                    storeKey.push(selector.split('__')[1].split(' ')[1])
                                }
                                else if(selector.indexOf('--') > -1 ){
                                    var key = selector.split('__')[1].split('--')[0]
                                    selectorObj[selectorKey][`&__${key}`][selector.split('__')[1].split('--')[1]] = {}
                                    hasAdded = true
                                    storeKey = []
                                    storeKey.push(selectorKey)
                                    storeKey.push(`&__${key}`)
                                    storeKey.push('&--'+selector.split('__')[1].split('--')[1])
                                }
                                else if(selector.split('__').length > 2){
                                    var key = selector.split('__')[1]
                                    selectorObj[selectorKey][`&__${key}`][`&__${selector.split('__')[2]}`] = {}
                                    hasAdded = true
                                    storeKey = []
                                    storeKey.push(selectorKey)
                                    storeKey.push(`&__${key}`)
                                    storeKey.push(`&__${selector.split('__')[2]}`)
                                }
                            }
                        }

                        if(!hasAdded){
                            if(selector.indexOf('>') > -1){
                                var key = selector.split('>')[0].trim();
                                selectorObj[selectorKey][selector.split('>')[1]] = {}
                                hasAdded = true
                                storeKey = []
                                storeKey.push(selectorKey)
                                storeKey.push(`& >${selector.split('>')[1]}`)
                            }
                            else {
                                var key = selector.indexOf(' ') > -1 ? selector.split(' ')[1] : selector.replace(selectorKey, '&')
                                selectorObj = {...selectorObj, [selectorKey] : {...selectorObj[selectorKey],[`${key}`]: {}} }
                                storeKey = []
                                storeKey.push(selectorKey)
                                storeKey.push(key)
                            }
                        }

                    }
                    else {
                        var hasSelectorParent = findBranch(selectorObj, selector)
                        if(!hasSelectorParent){
                            selectorObj = {...selectorObj, [`${selector}`]: {}}
                            storeKey = []
                            storeKey.push(`${selector}`)
                        }
                    }
                })
                if(Object.keys(selectorObj).length === 0) {
                    selectorObj = {[`${selector}`]: {}}
                    storeKey = []
                    storeKey.push(`${selector}`)
                }
            }
        }

        if(storeKey.length > 0 && lines[i].indexOf('{') === -1 && lines[i].indexOf('}') === -1 && lines[i].trim() !== '') {
            if(storeKey.length === 1) {
                selectorObj[storeKey[0]] = {...selectorObj[storeKey[0]], [lines[i].split(':')[0]] : lines[i].split(':')[1]}
            }
            if(storeKey.length === 2) {
                selectorObj[storeKey[0]] [storeKey[1]] = {...selectorObj[storeKey[0]] [storeKey[1]], [lines[i].split(':')[0]] : lines[i].split(':')[1]}
            }
            if(storeKey.length === 3) {
                selectorObj[storeKey[0]] [storeKey[1]] [storeKey[2]] = {...selectorObj[storeKey[0]] [storeKey[1]] [storeKey[2]], [lines[i].split(':')[0]] : lines[i].split(':')[1]}
            }
        }
    }

    var arrayPush = []
    var objIndex = {}

    var navigateIndex = function (obj, path = '') {
        Object.keys(obj).forEach((key, index)=>{
            if(typeof obj[key] === "object") {
                if(path !== '') {
                    objIndex[path] = {...objIndex[path], hasObject: index, lastPath: key}
                }
                objIndex[path+key] = {count:Object.keys(obj[key]).length}
                navigateIndex(obj[key],path+key)
            }
        })
    }
    var concatTab = function (times) {
        var tab = ''
        for(var i = 0; i < times; i++){
            tab += '\t';
        }
        return tab;
    }


    navigateIndex(selectorObj);

    var sortAttributes = function (obj, children = false) {
        var arrayAttributes = []
        if(!children){
            Object.keys(obj).forEach((key, index2)=>{
                arrayAttributes = []
                // arrayAttributes2 = []
                Object.keys(obj[key]).forEach((key2, index2) => {
                    if(typeof obj[key][key2] !== "object"){
                        arrayAttributes.push(key2)
                    }
                    else {
                        console.log(key,key2)
                    }
                });
                if(arrayAttributes && arrayAttributes.length > 1){
                    arrayAttributes.sort((a,b)=>{
                        var first = (orders.indexOf(a.trim()) > -1) ? orders.indexOf(a.trim()) : 999
                        var second = (orders.indexOf(b.trim()) > -1) ? orders.indexOf(b.trim()) : 999
                        if( first < second)
                            return -1;
                        return 1;
                    })
                    const objCopy = obj[key];
                    obj[key] = {};
                    arrayAttributes.forEach((keyOrder) => {
                        obj[key][keyOrder] = objCopy[keyOrder]
                    })
                    obj[key] = {...obj[key],...objCopy}
                    // console.log('aqui',key)
                    // console.log('aqui', arrayAttributes)
                }
            });
        }
        else {

        }
        // console.log(obj)
        return obj
    }

    //order attributes
    selectorObj = sortAttributes(selectorObj);

    var navigateObject = function (obj,path = '', times = 0, path2 = '') {
        Object.keys(obj).forEach((key, index)=>{
            var tabs = concatTab(times)
            var currentPath = path + key
            var currentPath2 = path2 +'/'+ key
            if(typeof obj[key] === "object") {
                if(currentPath.indexOf('>') > -1 || currentPath.indexOf('--') > -1) {
                    arrayPush.pop();
                }
                tabs = concatTab(times)
                arrayPush.push(`${tabs}${key} {`)
                navigateObject(obj[key],currentPath, times + 1, currentPath2)
            }
            else {
                tabs = concatTab(times -1)
                if(obj[key]){
                    arrayPush.push(`${tabs}${key}:${obj[key]}`)
                }
                else{
                    arrayPush.push(`${tabs}${key}`)
                }
                if(index + 1  == objIndex[path].count) {
                    arrayPush.push(`${tabs}}\n`)
                    var split = currentPath2.split("/");
                    var index = split.slice(0, split.length - 2).join("");
                    if(objIndex[index] && objIndex[index].lastPath == currentPath2.split('/')[times]) {
                        tabs = concatTab(times -2)
                        arrayPush.push(`${tabs}}\n`)
                    }
                }
            }
        })
    }

    navigateObject(selectorObj)


    fs.unlink(newFIlePath, function (err) {
        // console.log('File deleted!');
    });

    fs.appendFile(newFIlePath, arrayPush.join('\n'), function (err) {
        if (err) throw err;
        // console.log('Saved!');
      });

    // console.log(lines.join('\n'))

});
});