import {createBoxPhysics, createBoxMesh} from './gameObjects.js';
import {
    // WebGLRenderer,
    // Scene,
    // PerspectiveCamera,
    // PointLight,
    // AmbientLight,
    TextureLoader,
    Mesh,
    MeshStandardMaterial,
    // MeshBasicMaterial,
    //MeshNormalMaterial,
    BoxGeometry
    //Geometry,
    // OctahedronGeometry,
    // Raycaster,
    // PCFSoftShadowMap,
    // RepeatWrapping,
    // Vector2
    //Vector3,
    //Face3,
    //ShapeUtils
} from '/node_modules/three/build/three.module.js';
import {
    Box2D,
    b2Vec2,
    // b2World,
    // b2CircleShape,
    // b2Body,
    b2FixtureDef,
    b2BodyDef,
    b2PolygonShape,
    MulFV
    // Dot,
    // CrossVV
} from '../box2d/Box2D.js';
import {GameObject} from './GameObject.js';
import {dampeningForce} from '../extras-math.js';
import { KeyPress } from '../KeyPress.js';
import {Mouse} from '../Mouse.js';

class Player extends GameObject{
    constructor(options, world, scene) {
        super(options, world, scene);

        this.playerForce = 2802;
        this.playerAngularForce = 200;
        this.dampeningForceScaler = 0.1;
        this.strafeMultipier = 1;
        this.linearDamping = this.playerForce/800;
        this.boostMultipier = 2.5;
        this.playerStrafeMultipier = 1;
        this.lastFired = performance.now();
        this.lastBurst = performance.now();
        this.bullets = [];
        this.angleToSeek = 0;

        this.init(options);
    }

    init(options) {
        this.physicsBody = Player.createPhysics(this.world, options.physics);
        this.mesh = Player.createMesh(options.mesh);
        this.angleToSeek = this.physicsBody.GetAngle();
        this.playerForce = options.physics.force || this.playerForce;
        this.playerAngularForce = options.physics.angularForce || this.playerAngularForce;
        this.dampeningForceScaler = options.physics.dampeningForceScaler;
        this.boostMultipier = options.physics.boostMultipier;
        this.playerStrafeMultipier = options.physics.strafeMultipier || this.playerStrafeMultipier;
    }

    bindKeys(keyBindings) {
        let bindings = [];

        for(let action in keyBindings) {
            let keys = [].concat(keyBindings[action]),
                handler = Player.actions[action] || (()=>{});

            handler = handler.bind(this);
            bindings = bindings.concat(keys.map(key=>['onKey', key, handler]));
        }

        this.keyBindings = KeyPress.bindKeys(bindings);

        return this.keyBindings;
    }

    bindMouse(canvas, mouseBindings) {
        this.mouse = new Mouse(canvas)
            .setup();
        for(let action in mouseBindings) {
            let evnt = mouseBindings[action];
            this.mouse.on(evnt, Player.actions[action].bind(this));
        }
    }

    step(dt) {
        this.seekAnAngle(dt);
    }

    update() {
        let pos = this.physicsBody.GetPosition(),
            angle = this.physicsBody.GetAngle();

        this.mesh.position.x = pos.x;
        this.mesh.position.y = -pos.y;
        this.mesh.rotation.z = -angle;

        this.bullets.forEach((b)=> {
            let pos = b.physics.GetPosition(),
                angle = b.physics.GetAngle();
            b.position.x = pos.x;
            b.position.y = -pos.y;
            b.rotation.z = -angle;
        });
    }

    // |-------------------|21
    // |------| 8
    //         |-----------|13
    seekAnAngle() {
        let angle = this.physicsBody.GetAngle(),
            da = this.angleToSeek - angle;

        this.physicsBody.ApplyTorque(da*10000);
        if(da < -0.001 || da > 0.001) {
            console.debug(`AngleToSeek: ${this.angleToSeek};\n Angle: ${angle};\n da: ${da}`);
        }
    }

    static createPhysics(/*world, options*/) {
        return createBoxPhysics.apply(this, arguments);
    }
    static createMesh(/*scene, options*/) {
        return createBoxMesh.apply(this, arguments);
    }
}

Player.actions = {
    'forward': function forward(evt) {
        if(evt.state) {
            let physics = this.physicsBody,
                angle = physics.GetAngle(),
                f = this.playerForce;

            if(evt.keyPress.getKeyState('ShiftLeft')) {
                f *= this.boostMultipier;
            }

            physics.ApplyForce(new b2Vec2(Math.cos(angle)*f, Math.sin(angle)*f), physics.GetWorldCenter());
            physics.ApplyImpulse(MulFV(-this.dampeningForceScaler, dampeningForce(physics.GetAngle(), physics.GetLinearVelocity())), physics.GetWorldCenter());
        }
    },
    'backward': function backward(evt) {
        if(evt.state) {
            let physics = this.physicsBody,
                angle = physics.GetAngle(),
                f = -this.playerForce;

            if(evt.keyPress.getKeyState('ShiftLeft')) {
                f *= this.boostMultipier;
            }

            physics.ApplyForce(new b2Vec2(Math.cos(angle)*f, Math.sin(angle)*f), physics.GetWorldCenter());
            physics.ApplyImpulse(MulFV(-this.dampeningForceScaler, dampeningForce(physics.GetAngle(), physics.GetLinearVelocity())), physics.GetWorldCenter());
        }
    },
    'strafe-right': function strafeRight(evt) {
        if(evt.state) {
            let physics = this.physicsBody,
                angle = physics.GetAngle();

            physics.ApplyForce(MulFV(this.playerStrafeMultipier, new b2Vec2(-Math.sin(angle)*this.playerForce, Math.cos(angle)*this.playerForce)), physics.GetWorldCenter());
        }
    },
    'rotate-cw': function rotateCW(evt) {
        if(evt.state) {
            let pbox = this.physicsBody,
                angle = pbox.GetAngle();

            //pbox.SetAngle(angle + 1 * this.playerAngularForce * evt.dt);
            // this.angleToSeek = pbox.GetAngle();
            this.angleToSeek = angle + 1 * this.playerAngularForce * evt.dt;
            //pbox.SetAngularVelocity(0);
        }
    },
    'rotate-cc': function rotateCC(evt) {
        if(evt.state) {
            let pbox = this.physicsBody,
                angle = pbox.GetAngle();

            // pbox.SetAngle(angle + -1 * this.playerAngularForce * evt.dt);
            // this.angleToSeek = pbox.GetAngle();
            this.angleToSeek = angle + -1 * this.playerAngularForce * evt.dt;
            //pbox.SetAngularVelocity(0);
        }
    },
    'strafe-left': function strafeLeft(evt) {
        if(evt.state) {
            let physics = this.physicsBody,
                angle = physics.GetAngle();

            physics.ApplyForce(MulFV(-this.playerStrafeMultipier, new b2Vec2(-Math.sin(angle)*this.playerForce, Math.cos(angle)*this.playerForce)), physics.GetWorldCenter());
        }
    },
    'dash-forward': function dashForward(evt) {
        if(evt.state) {
            if(performance.now() - this.lastBurst > (2.0*1000)) {
                let angle = this.physicsBody.GetAngle();
                this.physicsBody.ApplyImpulse(new b2Vec2(Math.cos(angle)*this.playerForce*this.boostMultipier, Math.sin(angle)*this.playerForce*this.boostMultipier), this.physicsBody.GetWorldCenter());
                this.lastBurst = performance.now();
            }
        }
    },
    'dash-backward': function dashBackward(evt) {
        if(evt.state) {
            if(performance.now() - this.lastBurst > (2.0*1000)) {
                let angle = this.physicsBody.GetAngle();
                this.physicsBody.ApplyImpulse(new b2Vec2(Math.cos(angle)*-this.playerForce*this.boostMultipier, Math.sin(angle)*-this.playerForce*this.boostMultipier), this.physicsBody.GetWorldCenter());
                this.lastBurst = performance.now();
            }
        }
    },
    'fire': function fire(evt) {
        if(evt.state) {
            if(performance.now() - this.lastFired > (0.6*1000)) {
                fireBullet.call(this);
            }
        }
    },
    'puke': function puke(evt) {
        if(evt.state) {
            if(performance.now() - this.lastFired > (0.0*1000)) {
                fireBullet.call(this);
            }
        }
    },
    'mouse-rotation': function (evnt) {
        let physics = this.physicsBody;

        physics.SetAngle(physics.GetAngle() + (evnt.movementX)*0.01);
        physics.SetAngularVelocity(0);
    },
    'mouse-dash-forward': function() {
        if(performance.now() - this.lastBurst > (2.0*1000)) {
            let angle = this.physicsBody.GetAngle();
            this.physicsBody.ApplyImpulse(new b2Vec2(Math.cos(angle)*this.playerForce*this.boostMultipier, Math.sin(angle)*this.playerForce*this.boostMultipier), this.physicsBody.GetWorldCenter());
            this.lastBurst = performance.now();
        }
    },
    'mouse-dash-backward': function() {
        if(performance.now() - this.lastBurst > (2.0*1000)) {
            let angle = this.physicsBody.GetAngle();
            this.physicsBody.ApplyImpulse(new b2Vec2(Math.cos(angle)*-this.playerForce*this.boostMultipier, Math.sin(angle)*-this.playerForce*this.boostMultipier), this.physicsBody.GetWorldCenter());
            this.lastBurst = performance.now();
        }
    }
};

function fireBullet() {
    let physics = this.physicsBody,
        angle = physics.GetAngle(),
        pos = physics.GetPosition(),
        force = this.playerForce,
        impulseForce = new b2Vec2(Math.cos(angle)*force, Math.sin(angle)*force),
        initVel = physics.GetLinearVelocity(),
        bullet = createBullet.call(this, {x: Math.cos(angle)+pos.x, y: Math.sin(angle)+pos.y}, {width: 0.5, height: 0.5, depth: 0.5}, impulseForce, initVel);

    physics.ApplyImpulse(new b2Vec2(impulseForce.x*-0.5, impulseForce.y*-0.5), physics.GetWorldCenter());
    this.scene.add(bullet);
    this.bullets.push(bullet);
    setTimeout(()=> {
        removeBullet.call(this, bullet);
    }, 2000);
    this.lastFired = performance.now();
}

function createBullet(pos, dim, impulseForce, initVel) {
    let mesh =     createBulletMesh.call(this, {x: pos.x, y: -pos.y}, {width: dim.width*2, height: dim.height*2, depth: dim.depth*2}),
        physics = createBulletPhysics.call(this, pos, dim, impulseForce, initVel);

    mesh.physics = physics;

    return mesh;
}

function createBulletMesh(pos, dim) {
    let texture = new TextureLoader().load('textures/bullet/bullet.png', function(texture) {
            texture.offset.set(0, 0);
        }),
        material = new MeshStandardMaterial({
            'map':       texture,
            'roughness': 0.8
        }),
        bullet  = new Mesh(new BoxGeometry(dim.width, dim.height, dim.depth|| 1), material);

    bullet.position.x = pos.x;
    bullet.position.y = pos.y;
    bullet.castShadow = true;
    bullet.receiveShadow = true;

    return bullet;
}

function createBulletPhysics(pos, dim, impulseForce, initVel) {
    let shape = new b2PolygonShape(),
        fixtureDef = new b2FixtureDef(),
        bodyDef = new b2BodyDef();

    shape.SetAsOrientedBox(dim.width, dim.height, {x: 0, y: 0}, 0);
    fixtureDef.shape = shape;
    fixtureDef.density = 1;
    fixtureDef.friction = 0.2;
    fixtureDef.restitution = 0.8;
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    bodyDef.position = pos;
    bodyDef.angle = 0.0;
    let body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixtureDef);

    if(initVel) {
        body.SetLinearVelocity(initVel);
    }
    if(impulseForce) {
        body.ApplyImpulse(impulseForce, body.GetWorldCenter());
    }
    return body;
}

function removeBullet(b) {
    this.world.DestroyBody(b.physics);
    this.scene.remove(b);
    return b;
}

export {Player};
