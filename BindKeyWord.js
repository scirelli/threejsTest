'use strict';
var DELAY_DEFAULT = 500,
    WAIT_TIME     = DELAY_DEFAULT + 100;//Time to wait till key press queue is reset.

const BindKeyWord = function(oElm, nTimeMS) {
    this.setElement(oElm);
    this.nTimeMS = parseInt(nTimeMS) || DELAY_DEFAULT;
};

BindKeyWord.prototype = {
    bindCharsToKeyPresses: function(sChars, fCallBack, aParams, context) {
        'use strict';
        var aKeyTimes = [],
            me        = this,
            nTimerId  = 0;

        function reset() {
            aKeyTimes = [];
        }
        function clearT() {
            clearTimeout(nTimerId);
        }
        function timer() {
            var waitTime = WAIT_TIME;
            clearT();
            nTimerId = setTimeout(function() {
                reset();
                clearT();
            }, waitTime);
        }
        this.oElm.addEventListener('keypress', function(e) {
            var psz = aKeyTimes.length,
                dt  = 0;
            if( e.charCode === sChars.charCodeAt(psz) ) {
                aKeyTimes.push( {
                    pressedAt: new Date().getTime(),
                    key:       String.fromCharCode(e.charCode)
                });
                psz = aKeyTimes.length;
                if( psz >= 2 ) {//We now have two keys
                    dt = parseInt(aKeyTimes[psz-1].pressedAt - aKeyTimes[psz-2].pressedAt);
                    if( isNaN(dt) || dt > me.nTimeMS ) {
                        clearT();
                        reset();
                    }
                    if( aKeyTimes.length === sChars.length ) {
                        if( context ) {
                            fCallBack.apply(context, aParams);
                        }else{
                            fCallBack(aParams);
                        }
                        clearT();
                        reset();
                        return;
                    }
                }
                timer();
            }else{
                //clearTimeout(timerid);
                reset();
                clearT();
            }
        });
    },
    setElement: function( oElm ) {
        if( oElm.addEventListener ) {
            this.oElm = oElm;
        }else{
            throw 'Can not attach event listener to this element.' + oElm;
        }
    }
};

export {BindKeyWord};
