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
    BoxGeometry,
    OctahedronGeometry,
    Raycaster,
    PCFSoftShadowMap,
    RepeatWrapping,
    Vector2,
    Vector3
} from '/node_modules/three/build/three.module.js';
import {TDSLoader} from '/node_modules/three/examples/jsm/loaders/TDSLoader.js';
import {
    Box2D,
    b2Vec2,
    b2World,
    b2CircleShape,
    b2Body,
    b2FixtureDef,
    b2BodyDef,
    b2PolygonShape
} from './box2d/Box2D.js';

import { KeyPress } from './KeyPress.js';

const gravity = new b2Vec2(0.0, 10.0),
    DO_SLEEP = true,
    world = new b2World(gravity, DO_SLEEP),
    renderer = new WebGLRenderer(),
    loader = new TDSLoader(),
    scene = new Scene(),
    camera = new PerspectiveCamera(50, 1, 1, 10000),
    mainLight = new PointLight(0XFFFFFF, 1.0, 500, 2),
    ambientLight = new AmbientLight(0xF0F0F0, 0.5),

    container = document.body.querySelector('#main-container'),

    texture = new TextureLoader().load('textures/checker/redwhite.jpg'),
    spaceshipMaterial = new MeshStandardMaterial({
        'map':       new TextureLoader().load('textures/spaceships/arrow_thing.png'),
        'roughness': 0.8
    }),
    material = new MeshStandardMaterial({
        'map':       texture,
        'roughness': 0.8
    }),
    floor = createWall({x: 0*2, y: 20}, {width: 24, height: 0.5}),
    ceiling = createWall({x: 0*2, y: -20}, {width: 24, height: 0.5}),
    leftWall = createWall({x: -24, y: 0}, {width: 0.5, height: 20}),
    rightWall = createWall({x: 24, y: 0}, {width: 0.5, height: 20}),
    box1  = createPlayer({x: 0, y: 5}, {width: 4, height: 1, depth: 4}, material), //new Mesh(new BoxGeometry(8, 2, 4), material),
    box2  = createPlayer({x: 0, y: 0}, {width: 2, height: 1, depth: 1}, spaceshipMaterial), //new Mesh(new BoxGeometry(4, 2, 2), spaceshipMaterial),
    lightBall = new Mesh(new OctahedronGeometry(0.5, 2), new MeshBasicMaterial({color: 0xFFFFFF})),
    rayCaster = new Raycaster(),
    keyPress = new KeyPress(window);

let translate = {x: 0, y: 0},
    scale = 25,
    cameraMaximumDimension = 1,
    timeStep = 1.0/60,
    iteration = 1,
    canvas,
    balls = [];

scene.add(ceiling);
scene.add(floor);
scene.add(leftWall);
scene.add(rightWall);
box1.physics.SetFixedRotation(false);
scene.add(box1);
scene.add(box2);
scene.add(lightBall);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

container.appendChild(renderer.domElement);
canvas = document.body.querySelector('canvas');

lightBall.position.set(5, 5, 0);
mainLight.position.set(5, 5, 0);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 512;
mainLight.shadow.mapSize.height = 512;
scene.add(mainLight);
scene.add(ambientLight);

loader.load(
    'meshes/soccer_clients.3DS',

    function onLoad(obj) {
        obj.scale.set(new Vector3(0.02, 0.02, 0.02));
        scene.add(obj);
    },

    function onProgress(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded' );
    },

    function onError() {
        console.error('An error happened');
    }
);

let f = 100, hasGravity = true;

keyPress
    .onKey('w', (state)=> {
        if(state) {
            let pbox = box2.physics,
                angle = pbox.GetAngle();
            keyChange('w', state, box2, new b2Vec2(Math.cos(angle)*f, Math.sin(angle)*f));

            // let vel = pbox.GetLinearVelocity(),
            //     velAngle = Math.atan2(vel.y, vel.x),
            //     da = velAngle - angle;

            // if(da > velAngle) {
            //     turnBox(box2, -1000 * (da/velAngle));
            // }
            // if(da > velAngle) {
            //     turnBox(box2, 1000 * (da/velAngle));
            // }
        }
    })
    .onKey('s', (state)=> {
        if(state) {
            let angle = box2.physics.GetAngle();
            keyChange('w', state, box2, new b2Vec2(Math.cos(angle)*-f, Math.sin(angle)*-f));
        }
    })
    .onKey('l', (state)=> {
        if(state) {
            turnBox(box2, 1*0.1);
        }
    })
    .onKey('d', (state)=> {
        if(state) {
            turnBox(box2, 1*0.1);
        }
    })
    .onKey('j', (state)=> {
        if(state) {
            turnBox(box2, -1*0.1);
        }
    })
    .onKey('a', (state)=> {
        if(state) {
            turnBox(box2, -1*0.1);
        }
    })
    .onKey('ArrowLeft', (state)=> {
        if(state) {
            lightBall.position.x = mainLight.position.x -= 0.1;
        }
    })
    .onKey('ArrowRight', (state)=> {
        if(state) {
            lightBall.position.x = mainLight.position.x += 0.1;
        }
    })
    .onKey('ArrowUp', (state)=> {
        if(state) {
            lightBall.position.y = mainLight.position.y += 0.1;
        }
    })
    .onKey('ArrowDown', (state)=> {
        if(state) {
            lightBall.position.y = mainLight.position.y -= 0.1;
        }
    })
    .onKey(' ', (state)=> {
        if(state) {
            if(performance.now() - box2.physics.lastFired > (0.6*1000)) {
                let angle = box2.physics.GetAngle(),
                    pos = box2.physics.GetPosition(),
                    force = 100, //Math.randRange(10, 200),
                    impulseForce = new b2Vec2(Math.cos(angle)*force, Math.sin(angle)*force),
                    initVel = box2.physics.GetLinearVelocity(),
                    ball = createBouncyBall(Math.cos(angle)+pos.x, Math.sin(angle)+pos.y, impulseForce, initVel);

                box2.physics.ApplyImpulse(new b2Vec2(impulseForce.x*-0.5, impulseForce.y*-0.5), box2.physics.GetWorldCenter());
                balls.push(ball);
                setTimeout(()=> {
                    removeBall(ball);
                }, 2000);
                box2.physics.lastFired = performance.now();
            }
        }
    })
    .onKey('p', (state)=> {
        if(state) {
            if(performance.now() - box2.physics.lastFired > (0.0*1000)) {
                let angle = box2.physics.GetAngle(),
                    pos = box2.physics.GetPosition(),
                    force = 100, //Math.randRange(10, 200),
                    impulseForce = new b2Vec2(Math.cos(angle)*force, Math.sin(angle)*force),
                    initVel = box2.physics.GetLinearVelocity(),
                    ball = createBouncyBall(Math.cos(angle)+pos.x, Math.sin(angle)+pos.y, impulseForce, initVel);

                box2.physics.ApplyImpulse(new b2Vec2(impulseForce.x*-0.5, impulseForce.y*-0.5), box2.physics.GetWorldCenter());
                balls.push(ball);
                setTimeout(()=> {
                    removeBall(ball);
                }, 2000);
                box2.physics.lastFired = performance.now();
            }
        }
    })
    .onKeyPress('g', ()=> {
        hasGravity = !hasGravity;
        if(hasGravity)
            world.SetGravity(gravity);
        else
            world.SetGravity(new b2Vec2(0, 0));
    })
    .onKeyPress('r', ()=> {
        box1.physics.SetPosition({x: 0, y: 5});
        box1.physics.SetAngle(0);
        box1.physics.SetLinearVelocity({x: 0, y: 0});
        box1.physics.SetAngularVelocity();

        box2.physics.SetPosition({x: 0, y: 0});
        box2.physics.SetAngle(0);
        box2.physics.SetLinearVelocity({x: 0, y: 0});
        box2.physics.SetAngularVelocity();

        let b;
        while(b = balls.pop()) { //eslint-disable-line no-cond-assign
            removeBall(b);
        }
    });

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
    keyPress.processKeys();
    world.Step(timeStep, iteration);
    world.ClearForces();

    let pos = box1.physics.GetPosition(),
        angle = box1.physics.GetAngle();

    box1.position.x = pos.x;
    box1.position.y = -pos.y;
    box1.rotation.z = -angle;

    pos = box2.physics.GetPosition();
    angle = box2.physics.GetAngle();

    box2.position.x = pos.x;
    box2.position.y = -pos.y;
    box2.rotation.z = -angle;

    balls.forEach((b)=> {
        let pos = b.physical.GetPosition(),
            angle = b.physical.GetAngle();
        b.mesh.position.x = pos.x;
        b.mesh.position.y = -pos.y;
        b.mesh.rotation.z = -angle;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
})();

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

function keyChange(key, keyState, body, forceVector) {
    if(keyState) {
        body.physics.ApplyForce(forceVector, body.physics.GetWorldCenter());
    }
}

function turnBox(body, force) {
    let pbox = body.physics;

    pbox.SetAngle(pbox.GetAngle() + force);
    pbox.SetAngularVelocity(0);
    //pbox.ApplyTorque(force);
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
    world.DestroyBody(b.physical);
    scene.remove(b.mesh);
    return b;
}

function createBouncyBall(x=0, y=0, impulseForce, initVel) {
    let rtn = {
        mesh:     createBallMesh(x, y),
        physical: createBallPhysics(x, y, impulseForce, initVel)
    };
    rtn.mesh.physics = rtn.physical;
    return rtn;
}

function createBallMesh(x=0, y=0) {
    let geometry = new OctahedronGeometry(1, 2),
        texture = new TextureLoader().load('textures/checker/redwhite.jpg', function(texture) {
            texture.wrapS = texture.wrapT = RepeatWrapping;
            texture.offset.set(0, 0);
            texture.repeat.set(4, 4);
        }),
        material = new MeshStandardMaterial({
            'map':       texture,
            'roughness': 0.8
        }),
        ball = new Mesh(geometry, material);

    ball.castShadow = true;
    ball.receiveShadow = true;
    ball.position.set(x, y, 0);
    scene.add(ball);
    return ball;
}

function createBallPhysics(x=0, y=0, impulseForce, initVel) {
    let circleShape = new b2CircleShape(1),
        circleFixtureDef = new b2FixtureDef(),
        circleBdDef = new b2BodyDef();

    circleFixtureDef.shape = circleShape;
    circleFixtureDef.density = 1.0;
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

function createPlayer(pos, dim,  material) {
    let physics = createPlayerPhysics(pos, dim),
        mesh = createPlayerMesh({x: physics.GetPosition().x, y: -physics.GetPosition().y}, {width: dim.width*2, height: dim.height*2, depth: dim.depth}, material);
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
    let playerBody = world.CreateBody(playerBodyDef);
    playerBody.CreateFixture(playerFixtureDef);
    playerBody.SetFixedRotation(true);
    playerBody.lastFired = performance.now();

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
        mesh = createWallMesh({x: physics.GetPosition().x, y: -physics.GetPosition().y}, {width: dim.width*2, height: dim.height*2});
    mesh.physics = physics;
    return mesh;
}

function createWallMesh(pos, dim) {
    let texture = new TextureLoader().load('textures/checker/redwhite.jpg'),
        material = new MeshStandardMaterial({
            'map':       texture,
            'roughness': 0.8
        }),
        depth = 6,
        wall = new Mesh(new BoxGeometry(dim.width, dim.height, depth), material);

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
    floorfixtureDef.density = 1;
    floorfixtureDef.friction = 0.5;
    floorfixtureDef.restitution = 0.5;
    floorbodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
    floorbodyDef.position = pos;
    floorbodyDef.angle = 0.0;
    let floorbody = world.CreateBody(floorbodyDef);
    floorbody.CreateFixture(floorfixtureDef);
    return floorbody;
}

Math.randRange = function(min, max) {
    return (Math.random() * (max - min)) + min;
};
