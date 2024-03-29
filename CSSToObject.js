const { RULES, manageRules } = require("./rules");
const orders = RULES.orders;

const findBranch = (selectorObj, selector) => {
    let hasSelectorParent = false
    Object.keys(selectorObj).forEach((selectorKey, index) => {
        if(selector.indexOf(selectorKey) > -1) {
            hasSelectorParent = true
        }
    });
    return hasSelectorParent
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

const CSSToObject = (lines, colorsFormated) => {
    let selectors = [];
    let selectorObj = {};
    let storeKey = [];
    for(let i = 0;i < lines.length;i++){

        Object.keys(RULES.attributes).forEach((attribute)=> {
            manageRules(lines, attribute, i, colorsFormated);
        });

        if(lines[i].indexOf('{') > -1) {
            let selector = lines[i].replace('{', '').trim();

            if(selectors.indexOf(lines[i]) === -1){
                selectors.push(selector)
            }

            if(!selectorObj[selectorObj]) {
                Object.keys(selectorObj).forEach((selectorKey, index) => {
                    if (selector.indexOf(selectorKey) > -1) {

                        let hasAdded = false;
                        storeKey = [];

                        if(Object.keys(selectorObj[selectorKey]).length > 0) {
                            let hasSelectorParent = findBranch(selectorObj[selectorKey], selector)
                            if(!hasSelectorParent && selector.indexOf('__') > -1) {
                                if(selector.indexOf('>') > -1){
                                    let key = selector.split('__')[1].split('>')[0].trim();
                                    selectorObj[selectorKey][`&__${key}`][selector.split('__')[1].split('>')[1]] = {}
                                    hasAdded = true
                                    storeKey.push(selectorKey)
                                    storeKey.push(`&__${key}`)
                                    storeKey.push(`& >${selector.split('__')[1].split('>')[1]}`)
                                }
                                else if(selector.indexOf(':') > -1) {
                                    let key = selector.split('__')[1].split(':')[0];
                                    let countDots = selector.split(':').length -1;
                                    let key2 = selector.split('__')[1].split(':')[countDots];
                                    selectorObj[selectorKey][`&__${key}`]['&'+':'.repeat(countDots)+key2]= {}
                                    hasAdded = true
                                    storeKey.push(selectorKey)
                                    storeKey.push(`&__${key}`)
                                    storeKey.push('&'+':'.repeat(countDots)+key2)
                                }
                                else if(selector.indexOf(' ') > -1) {
                                    let key = selector.split('__')[1].split(' ')[0]
                                    selectorObj[selectorKey][`&__${key}`][selector.split('__')[1].split(' ')[1]] = {}
                                    hasAdded = true
                                    storeKey.push(selectorKey)
                                    storeKey.push(`&__${key}`)
                                    storeKey.push(selector.split('__')[1].split(' ')[1])
                                }
                                else if(selector.indexOf('--') > -1 ){
                                    let key = selector.split('__')[1].split('--')[0]
                                    selectorObj[selectorKey][`&__${key}`][selector.split('__')[1].split('--')[1]] = {}
                                    hasAdded = true
                                    storeKey.push(selectorKey)
                                    storeKey.push(`&__${key}`)
                                    storeKey.push('&--'+selector.split('__')[1].split('--')[1])
                                }
                                else if(selector.split('__').length > 2){
                                    let key = selector.split('__')[1]
                                    selectorObj[selectorKey][`&__${key}`][`&__${selector.split('__')[2]}`] = {}
                                    hasAdded = true
                                    storeKey.push(selectorKey)
                                    storeKey.push(`&__${key}`)
                                    storeKey.push(`&__${selector.split('__')[2]}`)
                                }
                            }
                        }

                        if(!hasAdded){
                            if(selector.indexOf('>') > -1){
                                selectorObj[selectorKey][selector.split('>')[1]] = {}
                                storeKey.push(selectorKey)
                                storeKey.push(`& >${selector.split('>')[1]}`)
                            }
                            else {
                                let key = selector.indexOf(' ') > -1 ? selector.split(' ')[1] : selector.replace(selectorKey, '&')
                                selectorObj = {...selectorObj, [selectorKey] : {...selectorObj[selectorKey],[`${key}`]: {}} }
                                storeKey.push(selectorKey)
                                storeKey.push(key)
                            }
                        }

                    }
                    else {
                        let hasSelectorParent = findBranch(selectorObj, selector)
                        if(!hasSelectorParent){
                            selectorObj = {...selectorObj, [`${selector}`]: {}}
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

    return selectorObj;
}

module.exports = {CSSToObject, findBranch, sortAttributes}