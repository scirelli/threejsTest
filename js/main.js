/*eslint-disable no-console*/

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
import {OBJLoader} from '/node_modules/three/examples/jsm/loaders/OBJLoader.js';
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

import { KeyPress } from './KeyPress.js';
import { dampeningForce } from './helpers.js';

Math.randRange = function(min, max) {
    return (Math.random() * (max - min)) + min;
};
const DO_SLEEP = true,
    //HALF_PI = Math.PI/2;
    FIXED_TIMESTEP = 1/60, //1s/60 frames
    MAX_STEPS = 5;

const gravity = new b2Vec2(0.0, 0.0),
    //DEGTORAD = 0.0174533,
    translate = {x: 0, y: 0},
    scale = 25,
    world = new b2World(gravity, DO_SLEEP),
    renderer = new WebGLRenderer(),
    //loader = new TDSLoader(),
    loader = new OBJLoader(),
    scene = new Scene(),
    camera = new PerspectiveCamera(50, 1, 1, 10000),
    mainLight = new PointLight(0XFFFFFF, 1.0, 500, 2),
    ambientLight = new AmbientLight(0xF0F0F0, 0.5),

    container = document.body.querySelector('#main-container'),
    debugOutput = document.body.querySelector('#console textarea'),

    spaceshipMaterial = new MeshStandardMaterial({
        'map':       new TextureLoader().load('textures/spaceships/arrow_thing.png'),
        'roughness': 0.8
    }),
    material = new MeshStandardMaterial({
        'map':       new TextureLoader().load('textures/checker/redwhite.jpg'),
        'roughness': 0.8
    }),
    rayCaster = new Raycaster();

let canvas,
    balls = [],
    keyPress = null,
    cameraMaximumDimension = 1,
    hasGravity = true,
    playerForce = 2802,
    playerAngularForce = 400/400,
    dampeningForceScaler = 0.1,
    linearDamping = playerForce/800,
    boostMultipier = 2.5,
    fixedTimestepAccumulator = 0,
    fixedTimestepAccumulatorRatio = 0,
    nSteps = 1,
    nStepsClamped = MAX_STEPS,
    dt = performance.now()*0.001;

const floor     = createWall({x: 0*2, y: 80}, {width: 110, height: 0.5, depth: 6}),
    ceiling   = createWall({x: 0*2, y: -80}, {width: 110, height: 0.5, depth: 6}),
    leftWall  = createWall({x: -109.728, y: 0}, {width: 0.5, height: 80, depth: 6}),
    rightWall = createWall({x: 109.728, y: 0}, {width: 0.5, height: 80, depth: 6}),
    box1      = createPlayer({x: 0, y: 5}, {width: 4, height: 1, depth: 4}, material), //new Mesh(new BoxGeometry(8, 2, 4), material),
    playerOne = createPlayer({x: 0, y: 0}, {width: 2, height: 1, depth: 1}, spaceshipMaterial), //new Mesh(new BoxGeometry(4, 2, 2), spaceshipMaterial),
    lightBall = new Mesh(new OctahedronGeometry(0.5, 2), new MeshBasicMaterial({color: 0xFFFFFF}));

balls.push(createBouncyBall(0, -4));
scene.add(balls[balls.length-1]);
scene.add(ceiling);
scene.add(floor);
scene.add(leftWall);
scene.add(rightWall);
box1.physics.SetFixedRotation(false);
scene.add(box1);
scene.add(playerOne);
scene.add(lightBall);

camera.zoom = 0.3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

container.appendChild(renderer.domElement);
canvas = document.body.querySelector('canvas');

lightBall.position.set(0, 0, -5);
mainLight.position.set(0, 0, -5);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 512;
mainLight.shadow.mapSize.height = 512;
scene.add(mainLight);
scene.add(ambientLight);

loader.load(
    'meshes/soccer_clients.obj',

    function onLoad(obj) {
        obj.scale.set(0.02, 0.02, 0.02);

        obj.position.x = 0;
        obj.position.y = 0;
        obj.castShadow = true;
        obj.receiveShadow = true;
        //soccerCleatBody = obj;
        //scene.add(obj);
    },

    function onProgress(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded' );
    },

    function onError() {
        console.error('An error happened');
    }
);

if(window.location.search.indexOf('debug') !== -1) {
    document.body.querySelector('#console').classList.toggle('open');
}
console.debug = (()=>{
    let oldDebug = console.debug;

    return (...args)=> {
        debugOutput.value = args.join('\n') + '\n' + debugOutput.value.substring(0, 512);
        oldDebug.apply(console, args);
    };
})();

keyPress = KeyPress.bindKeys([
    ['onKey', 'KeyW', (state, code, keyPress)=> {
        if(state) {
            let physics = playerOne.physics,
                angle = physics.GetAngle(),
                f = playerForce;

            if(keyPress.getKeyState('ShiftLeft')) {
                f *= boostMultipier;
            }

            applyForce(playerOne, new b2Vec2(Math.cos(angle)*f, Math.sin(angle)*f));
            playerOne.physics.ApplyImpulse(MulFV(-dampeningForceScaler, dampeningForce(physics.GetAngle(), physics.GetLinearVelocity())), playerOne.physics.GetWorldCenter());
        }
    }],
    ['onKey', 'KeyS', (state)=> {
        if(state) {
            let physics = playerOne.physics,
                angle = physics.GetAngle(),
                f = -playerForce;

            if(keyPress.getKeyState('ShiftLeft')) {
                f *= boostMultipier;
            }
            applyForce(playerOne, new b2Vec2(Math.cos(angle)*f, Math.sin(angle)*f));
            playerOne.physics.ApplyImpulse(MulFV(-dampeningForceScaler, dampeningForce(physics.GetAngle(), physics.GetLinearVelocity())), playerOne.physics.GetWorldCenter());
        }
    }],
    ['onKey', 'KeyL', (state)=> {
        if(state) {
            turnBox(playerOne, 1*playerAngularForce);
        }
    }],
    ['onKey', 'KeyD', (state)=> {
        if(state) {
            turnBox(playerOne, 1*playerAngularForce);
        }
    }],
    ['onKey', 'KeyJ', (state)=> {
        if(state) {
            turnBox(playerOne, -1*playerAngularForce);
        }
    }],
    ['onKey', 'KeyA', (state)=> {
        if(state) {
            turnBox(playerOne, -1*playerAngularForce);
        }
    }],
    ['onKey', 'KeyI', (state)=> {
        if(state) {
            if(performance.now() - playerOne.physics.lastBurst > (2.0*1000)) {
                let angle = playerOne.physics.GetAngle();
                playerOne.physics.ApplyImpulse(new b2Vec2(Math.cos(angle)*playerForce*boostMultipier, Math.sin(angle)*playerForce*boostMultipier), playerOne.physics.GetWorldCenter());
                playerOne.physics.lastBurst = performance.now();
            }
        }
    }],
    ['onKey', 'KeyK', (state)=> {
        if(state) {
            if(performance.now() - playerOne.physics.lastBurst > (2.0*1000)) {
                let angle = playerOne.physics.GetAngle();
                playerOne.physics.ApplyImpulse(new b2Vec2(Math.cos(angle)*-playerForce*boostMultipier, Math.sin(angle)*-playerForce*boostMultipier), playerOne.physics.GetWorldCenter());
                playerOne.physics.lastBurst = performance.now();
            }
        }
    }],
    ['onKey', 'ArrowLeft', (state)=> {
        if(state) {
            lightBall.position.x = mainLight.position.x -= 0.1;
        }
    }],
    ['onKey', 'ArrowRight', (state)=> {
        if(state) {
            lightBall.position.x = mainLight.position.x += 0.1;
        }
    }],
    ['onKey', 'ArrowUp', (state)=> {
        if(state) {
            lightBall.position.y = mainLight.position.y += 0.1;
        }
    }],
    ['onKey', 'ArrowDown', (state)=> {
        if(state) {
            lightBall.position.y = mainLight.position.y -= 0.1;
        }
    }],
    ['onKey', 'Space', (state)=> {
        if(state) {
            if(performance.now() - playerOne.physics.lastFired > (0.6*1000)) {
                fireBullet();
            }
        }
    }],
    ['onKey', 'KeyP', (state)=> {
        if(state) {
            if(performance.now() - playerOne.physics.lastFired > (0.0*1000)) {
                fireBullet();
            }
        }
    }],
    ['onKey', 'Equal', (()=>{
        let repeatTime = 200,
            lastRepeatTime = performance.now();
        return (state)=> {
            if(!state) return;
            if((performance.now() - lastRepeatTime) > repeatTime) {
                if(keyPress.getKeyState('ShiftLeft') && keyPress.getKeyState('KeyF')) {
                    playerForce += 1;
                    console.debug(`Force: ${playerForce}`);
                } else if(keyPress.getKeyState('ControlRight') && keyPress.getKeyState('KeyF')) {
                    playerOne.physics.SetLinearDamping(playerOne.physics.GetLinearDamping() + 1);
                    console.debug(`Force Dampening: ${playerOne.physics.GetLinearDamping()}`);
                }
                lastRepeatTime = performance.now();
            }
        };
    })()],
    ['onKey', 'Minus', (()=>{
        let repeatTime = 200,
            lastRepeatTime = performance.now();
        return (state)=> {
            if(!state) return;
            if((performance.now() - lastRepeatTime) > repeatTime) {
                if(keyPress.getKeyState('ShiftLeft') && keyPress.getKeyState('KeyF')) {
                    playerForce -= 1;
                    console.debug(`Force: ${playerForce}`);
                }else if(keyPress.getKeyState('ControlRight') && keyPress.getKeyState('KeyF')) {
                    playerOne.physics.SetLinearDamping(playerOne.physics.GetLinearDamping() - 1);
                    console.debug(`Force Dampening: ${playerOne.physics.GetLinearDamping()}`);
                }
                lastRepeatTime = performance.now();
            }
        };
    })()],
    ['onKeyPress', 'Backquote', ()=> {
        document.body.querySelector('#console').classList.toggle('open');
    }],
    ['onKeyPress', 'KeyG', ()=> {
        hasGravity = !hasGravity;
        if(hasGravity)
            world.SetGravity(gravity);
        else
            world.SetGravity(new b2Vec2(0, 0));
    }],
    ['onKeyPress', 'KeyR', ()=> {
        box1.physics.SetPosition({x: 0, y: 5});
        box1.physics.SetAngle(0);
        box1.physics.SetLinearVelocity({x: 0, y: 0});
        box1.physics.SetAngularVelocity();

        playerOne.physics.SetPosition({x: 0, y: 0});
        playerOne.physics.SetAngle(0);
        playerOne.physics.SetLinearVelocity({x: 0, y: 0});
        playerOne.physics.SetAngularVelocity(0);

        let b;
        while(b = balls.pop()) { //eslint-disable-line no-cond-assign
            removeBall(b);
        }
    }]
]);

resizeCanvas();

window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('click', (evt)=> {
    evt.preventDefault();

    let mousePosition = new Vector2();

    mousePosition.x = ((evt.clientX - canvas.offsetLeft) / canvas.width) * 2 - 1;
    mousePosition.y = -((evt.clientY - canvas.offsetTop) / canvas.height) * 2 + 1;
    rayCaster.setFromCamera(mousePosition, camera);
    let intersections = rayCaster.intersectObjects(scene.children, true),
        obj = intersections[0];

    if(obj) {
        let mag = Math.sqrt(obj.point.x*obj.point.x + obj.point.y*obj.point.y),
            uv = {x: obj.point.x/mag, y: obj.point.y/mag},
            f = 50;

        obj.object.physics.ApplyImpulse(
            new b2Vec2(uv.x*-f, uv.y*f),
            obj.object.physics.GetWorldCenter()
        );
    }else {
        balls.push(createBouncyBall(rayCaster.ray.x, rayCaster.ray.y));
    }
});

(function animate() {
    dt = performance.now()*0.001 - dt;
    fixedTimestepAccumulator += dt;
    nSteps = Math.floor(fixedTimestepAccumulator / FIXED_TIMESTEP);
    // To avoid rounding errors, touches fixedTimestepAccumulator_ only if needed.
    if(nSteps > 0) {
        fixedTimestepAccumulator -= nSteps * FIXED_TIMESTEP;
    }
    fixedTimestepAccumulatorRatio = fixedTimestepAccumulator / FIXED_TIMESTEP;

    nStepsClamped = Math.min(nSteps, MAX_STEPS);
    for(let i = 0; i < nStepsClamped; ++i) {
        resetSmoothStates();
        singleStep(FIXED_TIMESTEP);
    }
    world.ClearForces();

    draw();

    smoothStates(fixedTimestepAccumulatorRatio);
    dt = performance.now()*0.001;
    requestAnimationFrame(animate);
})();

function singleStep(dt) {
    keyPress.processKeys(dt);
    world.Step(dt, 1);
}

function smoothStates(fixedTimestepAccumulatorRatio) {
    let dt = fixedTimestepAccumulatorRatio * FIXED_TIMESTEP;

    for(let b=world.GetBodyList(); b; b = b.GetNext()) {
        if(b.GetType() === Box2D.Dynamics.b2Body.b2_staticBody) {
            continue;
        }

        b.smoothedPosition = b.GetPosition() + dt * b.GetLinearVelocity();
        b.smoothedAngle = b.GetAngle() + dt * b.GetAngularVelocity();
    }
}

function resetSmoothStates() {
    for(let b = world.GetBodyList(); b; b = b.GetNext()) {
        if(b.GetType() === Box2D.Dynamics.b2Body.b2_staticBody) {
            continue;
        }

        b.smoothedPosition = b.GetPosition();
        b.smoothedAngle = b.GetAngle();
    }
}

function draw() {
    let pos = box1.physics.GetPosition(),
        angle = box1.physics.GetAngle();

    box1.position.x = pos.x;
    box1.position.y = -pos.y;
    box1.rotation.z = -angle;

    pos = playerOne.physics.GetPosition();
    angle = playerOne.physics.GetAngle();

    playerOne.position.x = pos.x;
    playerOne.position.y = -pos.y;
    playerOne.rotation.z = -angle;

    balls.forEach((b)=> {
        let pos = b.physics.GetPosition(),
            angle = b.physics.GetAngle();
        b.position.x = pos.x;
        b.position.y = -pos.y;
        b.rotation.z = -angle;
    });
    camera.position.x = pos.x;
    camera.position.y = -pos.y;
    renderer.render(scene, camera);
}

function resizeCanvas() {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    var cameraSize = renderer.getSize(new Vector2());
    cameraMaximumDimension = Math.max(cameraSize.x, cameraSize.y);
    var renderSize = {x: cameraMaximumDimension, y: cameraMaximumDimension};
    camera.aspect = 1;
    camera.setViewOffset(
        renderSize.x, renderSize.y,
        (renderSize.x-cameraSize.x)/2, (renderSize.y-cameraSize.y)/2,
        cameraSize.x, cameraSize.y
    );
    camera.updateProjectionMatrix();

    updateCameraPosition();
}

function applyForce(body, forceVector) {
    body.physics.ApplyForce(forceVector, body.physics.GetWorldCenter());
}

function turnBox(body, force) {
    let pbox = body.physics;

    pbox.SetAngle(pbox.GetAngle() + force*0.1);
    pbox.SetAngularVelocity(0);
    //pbox.ApplyTorque(force);
    //console.debug(`Angular Velocity: ${pbox.GetAngularVelocity()}`);
    // if(pbox.GetAngularVelocity() > 3) {
    //     pbox.SetAngularVelocity(3);
    // }
    // if(pbox.GetAngularVelocity() < -3) {
    //     pbox.SetAngularVelocity(-3);
    // }
}

function updateCameraPosition() {
    camera.position.set(translate.x, -translate.y, 1.21*cameraMaximumDimension/scale);
}

function removeBall(b) {
    world.DestroyBody(b.physics);
    scene.remove(b);
    return b;
}

function createBouncyBall(x=0, y=0, impulseForce, initVel) {
    let mesh =     createBallMesh(x, y),
        physics = createBallPhysics(x, y, impulseForce, initVel);

    mesh.physics = physics;
    return mesh;
}

function createBallMesh(x=0, y=0) {
    let geometry = new OctahedronGeometry(4, 2),
        texture = new TextureLoader().load('textures/checker/redwhite.jpg', function(texture) {
            texture.wrapS = texture.wrapT = RepeatWrapping;
            texture.offset.set(0, 0);
            texture.repeat.set(4, 4);
        }),
        material = new MeshStandardMaterial({
            'map':       texture,
            'roughness': 0.8
        }),
        //ball = soccerCleatBody.clone();
        ball = new Mesh(geometry, material);

    ball.material = material;
    ball.castShadow = true;
    ball.receiveShadow = true;
    ball.position.set(x, y, 0);
    scene.add(ball);
    return ball;
}

function createBallPhysics(x=0, y=0, impulseForce, initVel) {
    let circleShape = new b2CircleShape(4),
        circleFixtureDef = new b2FixtureDef(),
        circleBdDef = new b2BodyDef();

    circleFixtureDef.shape = circleShape;
    circleFixtureDef.density = 0.2;
    circleFixtureDef.friction = Math.randRange(0.5, 1);
    circleFixtureDef.restitution = Math.randRange(0.0, 1.0);

    circleBdDef.type = b2Body.b2_dynamicBody;
    circleBdDef.position = {x: x, y: y};
    let ballbody = world.CreateBody(circleBdDef);
    ballbody.CreateFixture(circleFixtureDef);
    if(initVel) {
        ballbody.SetLinearVelocity(initVel);
    }
    if(impulseForce) {
        ballbody.ApplyImpulse(impulseForce, ballbody.GetWorldCenter());
    }
    return ballbody;
}

function fireBullet() {
    let angle = playerOne.physics.GetAngle(),
        pos = playerOne.physics.GetPosition(),
        force = playerForce, //Math.randRange(10, 200),
        impulseForce = new b2Vec2(Math.cos(angle)*force, Math.sin(angle)*force),
        initVel = playerOne.physics.GetLinearVelocity(),
        ball = createBullet({x: Math.cos(angle)+pos.x, y: Math.sin(angle)+pos.y}, {width: 0.5, height: 0.5, depth: 0.5}, impulseForce, initVel);

    playerOne.physics.ApplyImpulse(new b2Vec2(impulseForce.x*-0.5, impulseForce.y*-0.5), playerOne.physics.GetWorldCenter());
    scene.add(ball);
    balls.push(ball);
    setTimeout(()=> {
        removeBall(ball);
    }, 2000);
    playerOne.physics.lastFired = performance.now();
}

function createBullet(pos, dim, impulseForce, initVel) {
    let mesh =     createBulletMesh({x: pos.x, y: -pos.y}, {width: dim.width*2, height: dim.height*2, depth: dim.depth*2}),
        physics = createBulletPhysics(pos, dim, impulseForce, initVel);

    mesh.physics = physics;

    return mesh;
}

function createBulletMesh(pos, dim) {
    let texture = new TextureLoader().load('textures/bullet/bullet.png', function(texture) {
            //texture.wrapS = texture.wrapT = RepeatWrapping;
            texture.offset.set(0, 0);
            //texture.repeat.set(4, 4);
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
    let body = world.CreateBody(bodyDef);
    body.CreateFixture(fixtureDef);

    if(initVel) {
        body.SetLinearVelocity(initVel);
    }
    if(impulseForce) {
        body.ApplyImpulse(impulseForce, body.GetWorldCenter());
    }
    return body;
}

function createPlayer(pos, dim,  material) {
    let physics = createPlayerPhysics(pos, dim),
        mesh = createPlayerMesh({x: physics.GetPosition().x, y: -physics.GetPosition().y}, {width: dim.width*2, height: dim.height*2, depth: dim.depth*2}, material);
    mesh.physics = physics;
    return mesh;
}

function createPlayerPhysics(pos, dim) {
    let playerShape = new b2PolygonShape(),
        playerFixtureDef = new b2FixtureDef(),
        playerBodyDef = new b2BodyDef();

    playerShape.SetAsOrientedBox(dim.width, dim.height, {x: 0, y: 0}, 0);
    playerFixtureDef.shape = playerShape;
    playerFixtureDef.density = 1;
    playerFixtureDef.friction = 0.5;
    playerFixtureDef.restitution = 0.5;
    playerBodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    playerBodyDef.position = pos;
    playerBodyDef.angle = 0.0;
    playerBodyDef.linearDamping = linearDamping;
    //playerBodyDef.angularDamping = playerAngularForce/100;
    let playerBody = world.CreateBody(playerBodyDef);
    playerBody.CreateFixture(playerFixtureDef);
    playerBody.SetFixedRotation(true);
    playerBody.lastFired = performance.now();
    playerBody.lastBurst = performance.now();

    return playerBody;
}

function createPlayerMesh(pos, dim, material) {
    let player  = new Mesh(new BoxGeometry(dim.width, dim.height, dim.depth || 1), material);

    player.position.x = pos.x;
    player.position.y = pos.y;
    player.castShadow = true;
    player.receiveShadow = true;

    return player;
}

function createWall(pos, dim) {
    let physics = createWallPhysics(pos, dim),
        mesh = createWallMesh({x: physics.GetPosition().x, y: -physics.GetPosition().y}, {width: dim.width*2, height: dim.height*2, depth: dim.depth*2});
    mesh.physics = physics;
    return mesh;
}

function createWallMesh(pos, dim) {
    let texture = new TextureLoader().load('textures/checker/redwhite.jpg'),
        material = new MeshStandardMaterial({
            'map':       texture,
            'roughness': 0.8
        }),
        wall = new Mesh(new BoxGeometry(dim.width, dim.height, dim.depth), material);

    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.position.y = pos.y;
    wall.position.x = pos.x;

    return wall;
}

function createWallPhysics(pos, dim) {
    let floorshape = new b2PolygonShape(),
        floorfixtureDef = new b2FixtureDef(),
        floorbodyDef = new b2BodyDef();

    floorshape.SetAsOrientedBox(dim.width, dim.height, {x: 0, y: 0}, 0);
    floorfixtureDef.shape = floorshape;
    floorfixtureDef.density = 5;
    floorfixtureDef.friction = 0.5;
    floorfixtureDef.restitution = 0.5;
    floorbodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
    floorbodyDef.position = pos;
    floorbodyDef.angle = 0.0;
    let floorbody = world.CreateBody(floorbodyDef);
    floorbody.CreateFixture(floorfixtureDef);
    return floorbody;
}
