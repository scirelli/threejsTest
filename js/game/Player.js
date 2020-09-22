import {createBoxPhysics, createBoxMesh} from './gameObjects.js';
import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    PointLight,
    AmbientLight,
    TextureLoader,
    Mesh,
    MeshStandardMaterial,
    MeshBasicMaterial,
    //MeshNormalMaterial,
    BoxGeometry,
    //Geometry,
    OctahedronGeometry,
    Raycaster,
    PCFSoftShadowMap,
    RepeatWrapping,
    Vector2
    //Vector3,
    //Face3,
    //ShapeUtils
} from '/node_modules/three/build/three.module.js';
import {
    Box2D,
    b2Vec2,
    b2World,
    b2CircleShape,
    b2Body,
    b2FixtureDef,
    b2BodyDef,
    b2PolygonShape,
    MulFV
    // Dot,
    // CrossVV
} from './box2d/Box2D.js';
import {GameObject} from './GameObject.js';

class Player extends GameObject{
    constructor(options, physics, mesh) {
        super(options, physics, mesh);

        this.playerForce = 2802;
        this.playerAngularForce = 400/400;
        this.dampeningForceScaler = 0.1;
        this.linearDamping = this.playerForce/800;
        this.boostMultipier = 2.5;
        this.playerStrafeMultipier = 1;
        this.lastFired = performance.now();
        this.lastBurst = performance.now();

        this.init(options);
    }

    bindKeys(keyBindings) {}
    bindMouse(mouseBindings) {}
    update() {}

    createPhysics(/*world, options*/) {
        return createBoxPhysics.apply(this, arguments);
    }
    createMesh(/*scene, options*/) {
        return createBoxMesh.apply(this, arguments);
    }
}

export {Player};
