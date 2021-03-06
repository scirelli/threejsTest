/*
    0: Main button pressed, usually the left button or the un-initialized state
    1: Auxiliary button pressed, usually the wheel button or the middle button (if present)
    2: Secondary button pressed, usually the right button
    3: Fourth button, typically the Browser Back button
    4: Fifth button, typically the Browser Forward button
 */
class Mouse{
    constructor(elem) {
        this.elem = elem;
        this.listeners = {mousemove: []};
        this.moveHandler = this._onMouseMove.bind(this);
        this.clickHandler = this._onClick.bind(this);
    }

    setup() {
        this.elem.requestPointerLock = this.elem.requestPointerLock || this.elem.mozRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        document.addEventListener('pointerlockchange', this._lockChangeAlert.bind(this), false);
        document.addEventListener('mozpointerlockchange', this._lockChangeAlert.bind(this), false);

        this.elem.addEventListener('click', ()=> {
            this.elem.requestPointerLock();
        });

        return this;
    }

    on(type, l) {
        if(typeof(l) === 'function') {
            if(this.listeners[type]) {
                this.listeners[type].push(l);
            }else{
                this.listeners[type] = [l];
            }
        }

        let self = this;
        return function remove() {
            let i = self.listeners[type].indexOf(l);
            self.listeners[type].splice(i, 1);
        };
    }

    _lockChangeAlert() {
        if (document.pointerLockElement === this.elem || document.mozPointerLockElement === this.elem) {
            console.log('The pointer lock status is now locked');
            document.addEventListener('mousemove', this.moveHandler, false);
            document.addEventListener('click', this.clickHandler, false);
        } else {
            console.log('The pointer lock status is now unlocked');
            document.removeEventListener('mousemove', this.moveHandler, false);
            document.removeEventListener('click', this.clickHandler, false);
        }
    }

    _onMouseMove(e) {
        this.listeners.mousemove.forEach((l)=> {
            l(e);
        });
    }
    _onClick(e) {
        let listeners = this.listeners[e.button] || this.listeners.click || [];

        listeners.forEach((l)=> {
            l(e);
        });
    }
}

export {Mouse};
