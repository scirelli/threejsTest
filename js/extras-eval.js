function looseJsonParse(objStr, scopeName, scope) {
    return Function(`"use strict";return (function(${scopeName || 'none'}){ return (${objStr}); })`)()(scope);
}

if( !String.prototype.evalExp )
    String.prototype.evalExp = function(scopeName, scope) {
        return this.replace(/{{([^{}]*)}}/g, function(match, matchGroup) {
            return looseJsonParse(matchGroup, scopeName, scope);
        });
    };

/*
 * Limited to simple expressions and simple look ups. Will not work if a property was not previously evaluated.
 */
function compileObject(obj) {
    for(let scopeName in obj) {
        traverse(obj[scopeName], scopeName);
    }

    function traverse(subject, scopeName) {
        if(Array.isArray(subject) || typeof(subject) === 'object') {
            for(let prop in subject) {
                subject[prop] = traverse(subject[prop], scopeName);
            }
        }

        if(typeof(subject) === 'string') {
            return looseJsonParse(subject, scopeName, obj[scopeName]);
        }

        return subject;
    }
}

export {looseJsonParse, compileObject};
