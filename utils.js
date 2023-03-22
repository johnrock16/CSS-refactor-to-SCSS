const concatTab = function (times) {
    let tab = ''
    for(var i = 0; i < times; i++){
        tab += '\t';
    }
    return tab;
}

module.exports = {
    concatTab: concatTab,
}