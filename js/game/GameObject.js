import { KeyPress } from '../KeyPress.js';
import { Mouse } from '../Mouse.js';

class GameObject{
    constructor(options, world, scene) {
        this.world = world;
        this.scene = scene;
        this.mesh = null;
        this.physicsBody = null;
        this.keyBindings = new KeyPress(document.body);
        this.mouse = new Mouse(document.body);
    }

    update() {}

    getMesh() {
        return this.mesh;
    }
    getPhysicsBody() {
        return this.physicsBody;
    }

    static createPhysics(/*world, options*/) {}
    static createMesh(/*scene, options*/) {}
}

export {GameObject};
