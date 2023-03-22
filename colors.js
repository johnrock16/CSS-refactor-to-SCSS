function generateColors(colors) {
    let colorsFormated = {};
    colors.split('\n').forEach((color)=>{
        if(color && color.search(/[//]/) == -1){
            const [key,attribute] = color.split(':')
            colorsFormated = {...colorsFormated, [attribute.trim().replace(';','')]:key}
        }
    });
    return colorsFormated;
}

module.exports = {generateColors};