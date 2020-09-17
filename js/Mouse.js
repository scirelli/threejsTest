class Mouse{
    constructor(elem) {
        this.elem = elem;
        this.listeners = {mousemove: []};
        this.handler = this._onMouseMove.bind(this);
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
            document.addEventListener('mousemove', this.handler, false);
        } else {
            console.log('The pointer lock status is now unlocked');
            document.removeEventListener('mousemove', this.handler, false);
        }
    }

    _onMouseMove(e) {
        this.listeners.mousemove.forEach((l)=> {
            l(e);
        });
    }
}

export {Mouse};
