'use strict';

class KeyPress{
    static DOWN = true;
    static UP = false;

    constructor(oElm) {
        this.elm = oElm;
        this.oKeyCodes = {};
        this.oKeys = {};
        this.oListeners = {
            onEveryKeyCode:  {},
            onEveryKey:      {},
            onKeyCodeChange: {},
            onKeyChange:     {},
            onKeyPress:      {},
            onKeyCodePress:  {}
        };
        this._keydown = this.onKeyDown.bind(this);
        oElm.addEventListener('keydown', this._keydown);
        this._keyup = this.onKeyUp.bind(this);
        oElm.addEventListener('keyup', this._keyup);
    }

    onKeyDown(evnt) {
        let keyCode = evnt.keyCode || evnt.code;

        if(this.oKeyCodes[keyCode] !== KeyPress.DOWN) {
            for(let func of (this.oListeners.onKeyCodeChange[keyCode] || [])) {
                func(KeyPress.DOWN, keyCode);
            }
        }
        if(this.oKeys[evnt.key] !== KeyPress.DOWN) {
            for(let func of (this.oListeners.onKeyChange[evnt.key] || [])) {
                func(KeyPress.DOWN, evnt.key);
            }
        }

        this.oKeyCodes[keyCode] = KeyPress.DOWN;
        this.oKeys[evnt.key] = KeyPress.DOWN;

        for(let func of (this.oListeners.onEveryKeyCode[keyCode] || [])) {
            func(KeyPress.DOWN, keyCode);
        }

        for(let func of (this.oListeners.onEveryKey[evnt.key] || [])) {
            func(KeyPress.DOWN, evnt.key);
        }
    }

    onKeyUp(evnt) {
        let keyCode = evnt.keyCode || evnt.code;

        if(this.oKeyCodes[keyCode] !== KeyPress.UP) {
            for(let func of (this.oListeners.onKeyCodeChange[keyCode] || [])) {
                func(KeyPress.UP, keyCode);
            }
            for(let func of (this.oListeners.onKeyCodePress[keyCode] || [])) {
                func(KeyPress.UP, keyCode);
            }
        }
        if(this.oKeys[evnt.key] !== KeyPress.UP) {
            for(let func of (this.oListeners.onKeyChange[evnt.key] || [])) {
                func(KeyPress.UP, evnt.key);
            }
            for(let func of (this.oListeners.onKeyPress[evnt.key] || [])) {
                func(KeyPress.UP, evnt.key);
            }
        }

        this.oKeyCodes[keyCode] = KeyPress.UP;
        this.oKeys[evnt.key] = KeyPress.UP;

        for(let func of (this.oListeners.onEveryKeyCode[keyCode] || [])) {
            func(KeyPress.UP, keyCode);
        }

        for(let func of (this.oListeners.onEveryKey[evnt.key] || [])) {
            func(KeyPress.UP, evnt.key);
        }
    }

    bindKeyCode(keyCode, func) {
        this._bindKeyCode('onEveryKeyCode', keyCode, func);
        return this;
    }

    bindKey(key, func) {
        this._bindKey('onEveryKey', key, func);
        return this;
    }

    bindKeyCodeChange(keyCode, func) {
        this._bindKeyCode('onKeyCodeChange', keyCode, func);
        return this;
    }

    bindKeyChange(key, func) {
        this._bindKey('onKeyChange', key, func);
        return this;
    }

    bindKeyPress(key, func) {
        this._bindKey('onKeyPress', key, func);
        return this;
    }

    bindKeyCodePress(key, func) {
        this._bindKeyCode('onKeyCodePress', key, func);
        return this;
    }

    _bindKey(evnt, key, func) {
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

    _bindKeyCode(evnt, key, func) {
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

    getKeyState(key) {
        return this.oKeys[key];
    }

    getKeyCodeState(keyCode) {
        return this.oKeyCodes[keyCode];
    }

    static bindKeys(list) {
        let unbinds = [],
            keyPress = new KeyPress();
        bindKeys(list);

        function bindKeys(list) {
            list.forEach(o=> {
                unbinds.push(keyPress._bindKey.apply(keyPress, o));
            });
        }
        return {
            unbind: function unbind() {
                unbinds.forEach(u=>u());
            },
            bindKeys: bindKeys,
            keyPress: keyPress
        };
    }

    static bindKeyCodes(list) {
        let unbinds = [],
            keyPress = new KeyPress();
        bindKeyCodes(list);

        function bindKeyCodes(list) {
            list.forEach(o=> {
                unbinds.push(keyPress._bindKeyCode.apply(keyPress, o));
            });
        }
        return {
            unbind: function unbind() {
                unbinds.forEach(u=>u());
            },
            bindKeyCodes: bindKeyCodes,
            keyPress:     keyPress
        };
    }
}

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
