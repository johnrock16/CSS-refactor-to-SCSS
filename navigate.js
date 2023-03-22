const {concatTab} = require('./utils')

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

module.exports = Navigate;