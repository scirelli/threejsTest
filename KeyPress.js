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

        oElm.addEventListener('keydown', this.onKeyDown.bind(this));
        oElm.addEventListener('keyup', this.onKeyUp.bind(this));
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
        return this._bindKeyCode('onEveryKeyCode', keyCode, func);
    }

    bindKeyCodeChange(keyCode, func) {
        return this._bindKeyCode('onKeyCodeChange', keyCode, func);
    }

    bindKey(key, func) {
        return this._bindKey('onEveryKey', key, func);
    }

    bindKeyChange(key, func) {
        return this._bindKey('onKeyChange', key, func);
    }

    bindKeyPress(key, func) {
        return this._bindKey('onKeyPress', key, func);
    }

    bindKeyCodePress(key, func) {
        return this._bindKeyCode('onKeyCodePress', key, func);
    }

    _bindKey(evnt, key, func) {
        if(this.oListeners[evnt][key])
            this.oListeners[evnt][key].push(func);
        else
            this.oListeners[evnt][key] = [func];

        return this;
    }

    _bindKeyCode(evnt, key, func) {
        if(this.oListeners[evnt][key])
            this.oListeners[evnt][key].push(func);
        else
            this.oListeners[evnt][key] = [func];

        return this;
    }

    getKeyState(key) {
        return this.oKeys[key];
    }

    getKeyCodeState(keyCode) {
        return this.oKeyCodes[keyCode];
    }
}

export {KeyPress};
