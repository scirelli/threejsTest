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

    createPhysics(world, options) {
        let shape = new b2PolygonShape(),
            fixtureDef = new b2FixtureDef(),
            bodyDef = new b2BodyDef(),
            body;

        shape.SetAsOrientedBox(options.width, options.height, {x: 0, y: 0}, 0);
        fixtureDef.shape = shape;
        fixtureDef.density = 1;
        fixtureDef.friction = 0.5;
        fixtureDef.restitution = 0.5;
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position = options.pos || {x: 0, y: 0};
        bodyDef.angle = options.angle || 0.0;
        bodyDef.linearDamping = options.linearDamping;
        //bodyDef.angularDamping = options.playerAngularForce/100;
        body = world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);
        body.SetFixedRotation(options.fixedRotation || true);
        body.lastFired = performance.now();
        body.lastBurst = performance.now();

        this.physicsBody = body;
        return body;
    }

    createMesh(options) {
        let spaceshipMaterial = new MeshStandardMaterial({
            'map':       new TextureLoader().load('textures/spaceships/arrow_thing.png'),
            'roughness': 0.8
        }),
        player  = new Mesh(new BoxGeometry(dim.width*2, dim.height*2, dim.depth*2 || 1), spaceshipMaterial);

        player.position.x = this.physicsBody.GetPosition().x;
        player.position.y = -this.physicsBody.GetPosition().y;
        player.castShadow = true;
        player.receiveShadow = true;

        this.mesh = player;
        return player;
    }

    bindKeys(keyBindings) {}
    bindMouse(mouseBindings) {}
    update() {}
}

export {Player};
