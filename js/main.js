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
    PCFSoftShadowMap,
    Vector2
} from '/node_modules/three/build/three.module.js';
import {
    Box2D,
    b2Vec2,
    b2World,
    b2FixtureDef,
    b2BodyDef,
    b2PolygonShape
} from './box2d/Box2D.js';
import {Player} from './game/Player.js';
import {SoccerBall} from './game/SoccerBall.js';
import {KeyPress} from './KeyPress.js';
import {compileObject} from './extras-eval.js';
import {getJSON} from './extras-xhttp.js';

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
    //loader = new OBJLoader(),
    scene = new Scene(),
    camera = new PerspectiveCamera(45, 1, 1, 100000),
    mainLight = new PointLight(0XFFFFFF, 1.0, 500, 2),
    ambientLight = new AmbientLight(0xF0F0F0, 0.5),

    container = document.body.querySelector('#main-container'),
    debugOutput = document.body.querySelector('#console textarea');

let canvas,
    keyPress = null,
    cameraMaximumDimension = 1,
    hasGravity = true,
    fixedTimestepAccumulator = 0,
    fixedTimestepAccumulatorRatio = 0,
    nSteps = 1,
    nStepsClamped = MAX_STEPS,
    dt = performance.now()*0.001,
    player;

const floor     = createWall({x: 0*2, y: 80}, {width: 110, height: 0.5, depth: 6}),
    ceiling   = createWall({x: 0*2, y: -80}, {width: 110, height: 0.5, depth: 6}),
    leftWall  = createWall({x: -109.728, y: 0}, {width: 0.5, height: 80, depth: 6}),
    rightWall = createWall({x: 109.728, y: 0}, {width: 0.5, height: 80, depth: 6}),
    lightBall = new Mesh(new OctahedronGeometry(0.5, 2), new MeshBasicMaterial({color: 0xFFFFFF})),
    gameObjects = [];

getJSON('/js/game/objects.json')
    .then(response=> {
        return compileObject(response.responseJSON);
    })
    .then(config=> {
        let o;
        for(let obj in config) {
            switch(config[obj].type) {
                case 'Player':
                    o = new Player(config[obj], world, scene);

                    o.bindKeys(config[obj].keyBindings);
                    o.bindMouse(canvas, config[obj].mouseBindings);

                    break;
                case 'SoccerBall':
                    o = new SoccerBall(config[obj], world, scene);
                    break;
            }

            if(o) {
                gameObjects.push(o);
                scene.add(o.getMesh());

                if(config[obj].cameraFocus) {
                    player = o;
                }
            }
        }
    })
    .then(()=> {
        animate();
    });

scene.add(ceiling);
scene.add(floor);
scene.add(leftWall);
scene.add(rightWall);
scene.add(lightBall);

camera.zoom = 0.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

container.appendChild(renderer.domElement);
canvas = document.body.querySelector('canvas'),

lightBall.position.set(0, 0, -5);
mainLight.position.set(0, 0, -5);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 512;
mainLight.shadow.mapSize.height = 512;
scene.add(mainLight);
scene.add(ambientLight);

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

resizeCanvas();

keyPress = KeyPress.bindKeys([
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
    ['onKeyPress', 'Backquote', ()=> {
        document.body.querySelector('#console').classList.toggle('open');
    }],
    ['onKeyPress', 'KeyG', ()=> {
        hasGravity = !hasGravity;
        if(hasGravity)
            world.SetGravity(gravity);
        else
            world.SetGravity(new b2Vec2(0, 0));
    }]
]);

window.addEventListener('resize', resizeCanvas);

function animate() {
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
}

function singleStep(dt) {
    keyPress.processKeys(dt);
    gameObjects.forEach(o=> {
        o.keyBindings.processKeys(dt);
    });
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
    gameObjects.forEach(o=>o.update());

    let pos = player.physicsBody.GetPosition();
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

function updateCameraPosition() {
    camera.position.set(translate.x, -translate.y, 2*cameraMaximumDimension/scale);
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
