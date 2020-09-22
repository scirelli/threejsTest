import { KeyPress } from '../KeyPress.js';
import { Mouse } from '../Mouse.js';

class GameObject{
    mesh = null;
    physicsBody = null;
    keyBindings = null;
    mouse = null;

    constructor(options, physics, mesh) {
        this.mesh = mesh;
        this.physicsBody = physics;

        this.keyBindings = new KeyPress();
        this.mouse = new Mouse();
    }

    bindKeys() {}
    bindMouse() {}
    update() {}
    createPhysics(/*world, options*/) {}
    createMesh(/*scene, options*/) {}
}

export {GameObject};
