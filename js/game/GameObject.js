import { KeyPress } from '../KeyPress.js';

class GameObject{
    mesh = null;
    physics = null;
    keyBindings = null;

    constructor(options) {
        this.mesh;
        this.physics;
        this.keyBindings = new KeyPress();

        this.create(options);
    }

    create(options) {
        this.createMesh(options);
        this.createPhysics(options);
    }

    update() {}
}

export {GameObject};
