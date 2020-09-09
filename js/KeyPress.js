'use strict';

class KeyPress{
    constructor(oElm) {
        this.elm = oElm;
        this.oKeyCodeStates = {};
        this.oKeyStates = {};
        this.oListeners = {
            onKey:           {},
            onKeyCode:       {},
            onKeyCodeChange: {},
            onKeyChange:     {},
            onKeyCodePress:  {},
            onKeyPress:      {}
        };
        this._keydown = this._onKeyDown.bind(this);
        oElm.addEventListener('keydown', this._keydown);
        this._keyup = this._onKeyUp.bind(this);
        oElm.addEventListener('keyup', this._keyup);
    }

    processKeys() {
        for(let keyCode in this.oListeners.onKeyCode) {
            for(let listener of (this.oListeners.onKeyCode[keyCode] || [])) {
                listener(this.oKeyCodeStates[keyCode], keyCode);
            }
        }

        for(let key in this.oListeners.onKey) {
            for(let listener of (this.oListeners.onKey[key] || [])) {
                listener(this.oKeyStates[key], key);
            }
        }
    }

    onKey(key, func) {
        this._bindKeyCodeEvent('onKey', key, func);
        return this;
    }

    onKeyCode(keyCode, func) {
        this._bindKeyCodeEvent('onKeyCode', keyCode, func);
        return this;
    }

    onKeyCodeChange(keyCode, func) {
        this._bindKeyCodeEvent('onKeyCodeChange', keyCode, func);
        return this;
    }

    onKeyChange(key, func) {
        this._bindKeyEvent('onKeyChange', key, func);
        return this;
    }

    onKeyPress(key, func) {
        this._bindKeyEvent('onKeyPress', key, func);
        return this;
    }

    onKeyCodePress(key, func) {
        this._bindKeyCodeEvent('onKeyCodePress', key, func);
        return this;
    }

    getKeyState(key) {
        return this.oKeyStates[key];
    }

    getKeyCodeState(keyCode) {
        return this.oKeyCodeStates[keyCode];
    }

    unBind() {
        this.elm.removeEventListener('keyup', this._keyup);
        this.elm.removeEventListener('keydown', this._keydown);
    }

    _onKeyDown(evnt) {
        this._keyActivity(evnt, KeyPress.DOWN);
    }

    _onKeyUp(evnt) {
        let keyCode = evnt.keyCode || evnt.code;

        if(this.oKeyCodeStates[keyCode] !== KeyPress.UP) {
            for(let func of (this.oListeners.onKeyCodePress[keyCode] || [])) {
                func(KeyPress.UP, keyCode);
            }
        }
        if(this.oKeyStates[evnt.key] !== KeyPress.UP) {
            for(let func of (this.oListeners.onKeyPress[evnt.key] || [])) {
                func(KeyPress.UP, evnt.key);
            }
        }

        this._keyActivity(evnt, KeyPress.UP);
    }

    _keyActivity(evnt, state) {
        let keyCode = evnt.keyCode || evnt.code;

        if(this.oKeyCodeStates[keyCode] !== state) {
            for(let func of (this.oListeners.onKeyCodeChange[keyCode] || [])) {
                func(state, keyCode);
            }
        }
        if(this.oKeyStates[evnt.key] !== state) {
            for(let func of (this.oListeners.onKeyChange[evnt.key] || [])) {
                func(state, evnt.key);
            }
        }

        this.oKeyCodeStates[keyCode] = state;
        this.oKeyStates[evnt.key] = state;
    }

    _bindKeyEvent(evnt, key, func) {
        if(this.oListeners[evnt][key])
            this.oListeners[evnt][key].push(func);
        else
            this.oListeners[evnt][key] = [func];

        return ()=>{
            let i = this.oListeners[evnt][key].indexOf(func);
            this.oListeners[evnt][key].splice(i, 1);
            return this;
        };
    }

    _bindKeyCodeEvent(evnt, key, func) {
        if(this.oListeners[evnt][key])
            this.oListeners[evnt][key].push(func);
        else
            this.oListeners[evnt][key] = [func];

        return ()=>{
            let i = this.oListeners[evnt][key].indexOf(func);
            this.oListeners[evnt][key].splice(i, 1);
            return this;
        };
    }

    static bindKeys(list, oElm=window) {
        let keyPress = new KeyPress(oElm);

        list.forEach(args=> {
            keyPress._bindKeyEvent.apply(keyPress, args);
        });

        return keyPress;
    }

    static bindKeyCodes(list) {
        let keyPress = new KeyPress();

        list.forEach(args=> {
            keyPress._bindKeyCodeEvent.apply(keyPress, args);
        });
        return keyPress;
    }
}
KeyPress.DOWN = true;
KeyPress.UP = false;

function BindKeyWord(oElm, nTimeMS) {
    this.setElement(oElm);
    this.nTimeMS = parseInt(nTimeMS) || BindKeyWord.DELAY_DEFAULT;
}
BindKeyWord.DELAY_DEFAULT = 500;
BindKeyWord.WAIT_TIME = BindKeyWord.DELAY_DEFAULT + 100;//Time to wait till key press queue is reset.

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
            var waitTime = BindKeyWord.WAIT_TIME;
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

export {KeyPress, BindKeyWord};
