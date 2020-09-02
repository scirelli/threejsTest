class KeyPress{
    constructor(oElm) {
        this.elm = oElm;
        this.oKeyCodes = {};
        this.oKeys = {};
        this.oBoundKeyCodes = {};
        this.oBoundKeys = {};

        oElm.addEventListener('keydown', this.onKeyDown.bind(this));
        oElm.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(evnt) {
        let keyCode = evnt.keyCode || evnt.code;

        this.oKeyCodes[keyCode] = true;
        this.oKeys[evnt.key] = true;

        for(let func of (this.oBoundKeyCodes[keyCode] || [])) {
            func(true, keyCode);
        }

        for(let func of (this.oBoundKeys[evnt.key] || [])) {
            func(true, evnt.key);
        }
    }

    onKeyUp(evnt) {
        let keyCode = evnt.keyCode || evnt.code;

        this.oKeyCodes[keyCode] = false;
        this.oKeys[evnt.key] = false;

        for(let func of (this.oBoundKeyCodes[keyCode] || [])) {
            func(false, keyCode);
        }

        for(let func of (this.oBoundKeys[evnt.key] || [])) {
            func(false, evnt.key);
        }
    }

    bindKeyCode(keyCode, func) {
        if(this.oBoundKeyCodes[keyCode])
            this.oBoundKeyCodes[keyCode].push(func);
        else
            this.oBoundKeyCodes[keyCode] = [func];

        return this;
    }

    bindKey(key, func) {
        if(this.oBoundKeys[key])
            this.oBoundKeys[key].push(func);
        else
            this.oBoundKeys[key] = [func];

        return this;
    }

    keyState(key) {
        return this.oKeys[key];
    }

    keyCodeState(keyCode) {
        return this.oKeyCodes[keyCode];
    }
}

export {KeyPress};
