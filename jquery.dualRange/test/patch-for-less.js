/*  https://github.com/less/less.js/issues/3321 | Object.assign(c, d, f); would crash IE 11, fix this with a polyfill.
Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
Use this check instead of "if (typeof Object.assign != 'function') {..." since that would crash IE... */
if (!("assign" in Object)) {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        //var varArgs = c, d, f;
        value: function assign(target, varArgs) { // .length of function is 2
            'use strict';
            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}