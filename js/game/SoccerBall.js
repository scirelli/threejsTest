import {createCirclePhysics, createCircleMesh} from './gameObjects.js';
import {GameObject} from './GameObject.js';

class SoccerBall extends GameObject{
    constructor(options, world, scene) {
        super(options, world, scene);

        this.init(options);
    }

    init(options) {
        this.physicsBody = SoccerBall.createPhysics(this.world, options.physics);
        this.mesh = SoccerBall.createMesh(options.mesh);
    }

    update() {
        let pos = this.physicsBody.GetPosition(),
            angle = this.physicsBody.GetAngle();

        this.mesh.position.x = pos.x;
        this.mesh.position.y = -pos.y;
        this.mesh.rotation.z = -angle;
    }

    static createPhysics(/*world, options*/) {
        return createCirclePhysics.apply(this, arguments);
    }
    static createMesh(/*scene, options*/) {
        return createCircleMesh.apply(this, arguments);
    }
}

export {SoccerBall};
