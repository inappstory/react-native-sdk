/**
 * Add a stylesheet rule to the document (it may be better practice
 * to dynamically change classes, so style information can be kept in
 * genuine stylesheets and avoid adding extra elements to the DOM).
 * Note that an array is needed for declarations and rules since ECMAScript does
 * not guarantee a predictable object iteration order, and since CSS is
 * order-dependent.
 * @param {Array} rules Accepts an array of JSON-encoded declarations
 * @example
 addStylesheetRules([
 '@import url',
 ['h2', // Also accepts a second argument as an array of arrays instead
 ['color', 'red'],
 ['background-color', 'green', true] // 'true' for !important rules
 ],
 ['.myClass',
 ['background-color', 'yellow']
 ]
 ]);
 */
export function addStylesheetRules (rules) {
    var styleEl = document.createElement('style');

    // Append <style> element to <head>
    document.head.appendChild(styleEl);

    // Grab style element's sheet
    var styleSheet = styleEl.sheet;

    for (var i = 0; i < rules.length; i++) {
        if (Array.isArray(rules[i])) {
            var j = 1,
                rule = rules[i],
                selector = rule[0],
                propStr = '';
            // If the second argument of a rule is an array of arrays, correct our variables.
            if (Array.isArray(rule[1][0])) {
                rule = rule[1];
                j = 0;
            }

            for (var pl = rule.length; j < pl; j++) {
                var prop = rule[j];
                propStr += prop[0] + ': ' + prop[1] + (prop[2] ? ' !important' : '') + ';\n';
            }

            // Insert CSS Rule
            styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
        } else {
            styleSheet.insertRule(rules[i], styleSheet.cssRules.length);
        }
    }
}


/**
 * Gets computed translate values
 * @param {HTMLElement} element
 * @returns {Object}
 */
export function getTranslateValues (element) {
    const style = window.getComputedStyle(element)
    const matrix = style['transform'] || style.webkitTransform || style.mozTransform

    // No transform property. Simply return 0 values.
    if (matrix === 'none') {
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    // Can either be 2d or 3d transform
    const matrixType = matrix.includes('3d') ? '3d' : '2d'
    const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')

    // 2d matrices have 6 values
    // Last 2 values are X and Y.
    // 2d matrices does not have Z value.
    if (matrixType === '2d') {
        return {
            x: !isNaN(matrixValues[4]) ? matrixValues[4] : 0,
            y: !isNaN(matrixValues[5]) ? matrixValues[5] : 0,
            z: 0
        }
    }

    // 3d matrices have 16 values
    // The 13th, 14th, and 15th values are X, Y, and Z
    if (matrixType === '3d') {
        // console.log(matrixValues)
        return {
            x: !isNaN(matrixValues[12]) ? matrixValues[12] : 0,
            y: !isNaN(matrixValues[13]) ? matrixValues[13] : 0,
            z: !isNaN(matrixValues[14]) ? matrixValues[14] : 0
        }
    }
}


export function styleToString (style) {
    return Object.keys(style).reduce((acc, key) => (
        acc + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + style[key] + ';'
    ), '');
}
