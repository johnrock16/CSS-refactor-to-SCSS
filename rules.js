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
    },
    orders: ["position","top","left","bottom", "right","display","flex-direction","justify-content","align-items","width","height","max-width","max-height","padding","padding-top","padding-left","padding-bottom","padding-right","margin","margin-top","margin-left","margin-bottom","margin-right","gap","font-size","color","text-align","letter-spacing","text-transform","white-space","text-shadow","background","background-color","border","border-top","border-left","border-bottom","border-right","border-radius","opacity","z-index"]
}

const searchIndexAttribute = (line, regex) => {
    const index = line.search(regex)
    return {index, regex}
}

const manageRules = (lines, attribute, i, colorsFormated) => {
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
}

module.exports = {RULES, manageRules};