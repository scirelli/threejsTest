class KeyPress{
    static DOWN = true;
    static UP = false;

    constructor(oElm) {
        this.elm = oElm;
        this.oKeyCodes = {};
        this.oKeys = {};
        this.oBoundKeyCodes = {};
        this.oBoundKeys = {};
        this.oBoundKeyCodesChange = {};
        this.oBoundKeysChange = {};

        oElm.addEventListener('keydown', this.onKeyDown.bind(this));
        oElm.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(evnt) {
        let keyCode = evnt.keyCode || evnt.code;

        if(this.oKeyCodes[keyCode] !== KeyPress.DOWN) {
            for(let func of (this.oBoundKeyCodesChange[keyCode] || [])) {
                func(KeyPress.DOWN, keyCode);
            }
        }
        if(this.oKeys[evnt.key] !== KeyPress.DOWN) {
            for(let func of (this.oBoundKeysChange[keyCode] || [])) {
                func(KeyPress.DOWN, keyCode);
            }
        }

        this.oKeyCodes[keyCode] = KeyPress.DOWN;
        this.oKeys[evnt.key] = KeyPress.DOWN;

        for(let func of (this.oBoundKeyCodes[keyCode] || [])) {
            func(KeyPress.DOWN, keyCode);
        }

        for(let func of (this.oBoundKeys[evnt.key] || [])) {
            func(KeyPress.DOWN, evnt.key);
        }
    }

    onKeyUp(evnt) {
        let keyCode = evnt.keyCode || evnt.code;

        if(this.oKeyCodes[keyCode] !== KeyPress.UP) {
            for(let func of (this.oBoundKeyCodesChange[keyCode] || [])) {
                func(KeyPress.UP, keyCode);
            }
        }
        if(this.oKeys[evnt.key] !== KeyPress.UP) {
            for(let func of (this.oBoundKeysChange[keyCode] || [])) {
                func(KeyPress.UP, keyCode);
            }
        }

        this.oKeyCodes[keyCode] = KeyPress.UP;
        this.oKeys[evnt.key] = KeyPress.UP;

        for(let func of (this.oBoundKeyCodes[keyCode] || [])) {
            func(KeyPress.UP, keyCode);
        }

        for(let func of (this.oBoundKeys[evnt.key] || [])) {
            func(KeyPress.UP, evnt.key);
        }
    }

    bindKeyCode(keyCode, func) {
        if(this.oBoundKeyCodes[keyCode])
            this.oBoundKeyCodes[keyCode].push(func);
        else
            this.oBoundKeyCodes[keyCode] = [func];

        return this;
    }

    bindKeyCodeChange(keyCode, func) {
        if(this.oBoundKeyCodesChange[keyCode])
            this.oBoundKeyCodesChange[keyCode].push(func);
        else
            this.oBoundKeyCodesChange[keyCode] = [func];

        return this;
    }

    bindKey(key, func) {
        if(this.oBoundKeys[key])
            this.oBoundKeys[key].push(func);
        else
            this.oBoundKeys[key] = [func];

        return this;
    }

    bindKeyChange(key, func) {
        if(this.oBoundKeysChange[key])
            this.oBoundKeysChange[key].push(func);
        else
            this.oBoundKeysChange[key] = [func];

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
