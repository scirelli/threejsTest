/*global THREE*/
import {world, floorbody, box1Body, box2Body} from './gamePhysics.js';
import {
    b2FixtureDef,
    b2BodyDef,
    b2CircleShape,
    b2Body
} from './Box2D.js';

const renderer = new THREE.WebGLRenderer(),
    scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(50, 1, 1, 10000),
    mainLight = new THREE.PointLight(0XFFFFFF, 1.0, 500, 2),
    ambientLight = new THREE.AmbientLight(0xF0F0F0, 0.5),

    container = document.body.querySelector('#main-container'),

    texture = new THREE.TextureLoader().load('textures/checker/redwhite.jpg'),
    material = new THREE.MeshStandardMaterial({
        'map':       texture,
        'roughness': 0.8
    }),

    floor = new THREE.Mesh(new THREE.BoxGeometry(12, 2, 6), material),
    box1  = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 4), material),
    box2  = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 2), material),
    lightBall = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 2), new THREE.MeshBasicMaterial({color: 0xFFFFFF})),
    rayCaster = new THREE.Raycaster();

let translate = {x: 0, y: 0},
    scale = 25,
    cameraMaximumDimension = 1,
    timeStep = 1.0/60,
    iteration = 1,
    canvas,
    balls = [];

floor.position.y = -floorbody.GetPosition().y;
floor.castShadow = true;
floor.receiveShadow = true;
scene.add(floor);
box1.position.y = -box1Body.GetPosition().y;
box1.physics = box1Body;
box1.castShadow = true;
box1.receiveShadow = true;
scene.add(box1);
box2.position.y = -box2Body.GetPosition().y;
box2.castShadow = true;
box2.receiveShadow = true;
box2.physics = box2Body;
scene.add(box2);
scene.add(lightBall);


renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);
canvas = document.body.querySelector('canvas');

lightBall.position.set(5, 5, 0);
mainLight.position.set(5, 5, 0);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 512;
mainLight.shadow.mapSize.height = 512;
scene.add(mainLight);
scene.add(ambientLight);

window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('click', (evt)=> {
    evt.preventDefault();

    let mousePosition = new THREE.Vector2();

    mousePosition.x = ((evt.clientX - canvas.offsetLeft) / canvas.width) * 2 - 1;
    mousePosition.y = -((evt.clientY - canvas.offsetTop) / canvas.height) * 2 + 1;
    rayCaster.setFromCamera(mousePosition, camera);
    let intersections = rayCaster.intersectObjects(scene.children, true),
        obj = intersections[0];

    if(obj)
        obj.object.physics.ApplyImpulse({x: (obj.point.x/2)*10, y: (obj.point.x/2)*10}, {x: 0, y: 0});
    else
        balls.push(createBouncyBall(rayCaster.ray.x, rayCaster.ray.y));
});
window.addEventListener('keydown', function(e) {
    /*
    switch(e.keyCode) {
        case 37:
            console.log('left');
            break;
        case 38:
            console.log('up');
            break;
        case 39:
            console.log('right');
            break;
        case 40:
            console.log('down');
            break;
    }
    */
    switch (e.key) {
        case 'ArrowLeft':
            lightBall.position.x = mainLight.position.x -= 0.1;
            break;
        case 'ArrowRight':
            lightBall.position.x = mainLight.position.x += 0.1;
            break;
        case 'ArrowUp':
            lightBall.position.y = mainLight.position.y += 0.1;
            break;
        case 'ArrowDown':
            lightBall.position.y = mainLight.position.y -= 0.1;
            break;
    }
});

resizeCanvas();

(function animate() {
    world.Step(timeStep, iteration);

    let pos = box1Body.GetPosition(),
        angle = box1Body.GetAngle();
    //floorPos = floorbody.GetPosition();

    box1.position.x = pos.x;
    box1.position.y = -pos.y;
    box1.rotation.x = angle;
    box1.rotation.y = angle;

    pos = box2Body.GetPosition();
    angle = box2Body.GetAngle();

    box2.position.x = pos.x;
    box2.position.y = -pos.y;
    box2.rotation.x = angle;
    box2.rotation.y = angle;

    balls.forEach((b)=> {
        let pos = b.physical.GetPosition(),
            angle = b.physical.GetAngle();
        b.mesh.position.x = pos.x;
        b.mesh.position.y = -pos.y;
        b.mesh.rotation.x = angle;
        b.mesh.rotation.y = angle;
    });

    // console.log(`box2(${box2.position.x},${box2.position.y})`);
    // console.log(`box1(${box1.position.x},${box1.position.y})`);
    // console.log(`floor(${floorPos.x},${-floorPos.y})`);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
})();

function resizeCanvas() {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    var cameraSize = renderer.getSize(new THREE.Vector2());
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
    camera.position.set(translate.x, -translate.y, 1.21*cameraMaximumDimension/scale);
}

function createBouncyBall(x=0, y=0) {
    let rtn = {
        mesh:     createBallMesh(x, y),
        physical: createBallPhysics(x, y)
    };
    rtn.mesh.physics = rtn.physical;
    return rtn;
}

function createBallMesh(x=0, y=0) {
    let geometry = new THREE.OctahedronGeometry(1, 2),
        texture = new THREE.TextureLoader().load('textures/checker/redwhite.jpg'),
        material = new THREE.MeshStandardMaterial({
            'map':       texture,
            'roughness': 0.8
        }),
        ball = new THREE.Mesh(geometry, material);

    ball.castShadow = true;
    ball.receiveShadow = true;
    ball.position.set(x, y, 0);
    scene.add(ball);
    return ball;
}

function createBallPhysics(x=0, y=0) {
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

    return ballbody;
}

Math.randRange = function(min, max) {
    return (Math.random() * (max - min)) + min;
};
