const {RULES} = require('./rules');
const orders = RULES.orders;

const searchIndexAttribute = (line, regex) => {
    const index = line.search(regex)
    return {index, regex}
}

const findBranch = (selectorObj, selector) => {
    let hasSelectorParent = false
    Object.keys(selectorObj).forEach((selectorKey, index) => {
        if(selector.indexOf(selectorKey) > -1) {
            hasSelectorParent = true
        }
    });
    return hasSelectorParent
}

const concatTab = function (times) {
    let tab = ''
    for(var i = 0; i < times; i++){
        tab += '\t';
    }
    return tab;
}

const sortAttributes = function (obj, children = false) {
    let arrayAttributes = []
    let arrayAttributesAfter = [];
    let sortAfter = false;
    if(!children){

        Object.keys(obj).forEach((key, index2)=>{
            arrayAttributes = []
            // arrayAttributes2 = []
            if(typeof obj[key] === 'object') {
                Object.keys(obj[key]).forEach((key2, index2) => {
                    if(typeof obj[key][key2] !== "object"){
                        arrayAttributes.push(key2)
                    }
                    else {
                        obj[key][key2] = sortAttributes(obj[key][key2])
                    }
                });
            }
            else {
                arrayAttributesAfter.push(key);
                sortAfter = true
            }
            if(!sortAfter && arrayAttributes && arrayAttributes.length > 1){
                arrayAttributes.sort((a,b)=>{
                    let first = (orders.indexOf(a.trim()) > -1) ? orders.indexOf(a.trim()) : 999
                    let second = (orders.indexOf(b.trim()) > -1) ? orders.indexOf(b.trim()) : 999
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
                arrayAttributes = [];
            }
        });
        if(sortAfter && arrayAttributesAfter && arrayAttributesAfter.length > 1){
            arrayAttributesAfter.sort((a,b)=>{
                let first = (orders.indexOf(a.trim()) > -1) ? orders.indexOf(a.trim()) : 999
                let second = (orders.indexOf(b.trim()) > -1) ? orders.indexOf(b.trim()) : 999
                if( first < second)
                    return -1;
                return 1;
            })
            if (arrayAttributesAfter.length > 0) {
                const objCopy = {...obj}
                obj = {}
                arrayAttributesAfter.forEach((keyOrder) => {
                    obj[keyOrder] = objCopy[keyOrder]
                })
                obj = {...obj, ...objCopy}
                arrayAttributesAfter = []
            }
        }
    }
    return obj
}

const Navigate = function () {
    let arrayPush = [];
    let objIndex = {};

    const navigateIndex = function (obj, path = '') {
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

    const navigateObject = function (obj,path = '', times = 0, path2 = '') {
        Object.keys(obj).forEach((key, index)=>{
            let tabs = concatTab(times)
            let currentPath = path + key
            let currentPath2 = path2 +'/'+ key
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
                    let split = currentPath2.split("/");
                    let index = split.slice(0, split.length - 2).join("");
                    if(objIndex[index] && objIndex[index].lastPath == currentPath2.split('/')[times]) {
                        tabs = concatTab(times -2)
                        arrayPush.push(`${tabs}}\n`)
                    }
                }
            }
        })
    }

    return({
        navigateIndex: navigateIndex,
        navigateObject: navigateObject,
        arrayPush: () => { return arrayPush},
        objIndex: () => { return objIndex}
    })
}

module.exports = {
    searchIndexAttribute: searchIndexAttribute,
    findBranch: findBranch,
    concatTab: concatTab,
    sortAttributes: sortAttributes,
    Navigate: Navigate,
}