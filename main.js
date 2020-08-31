/*global THREE*/
import {world, ballbody, floorbody} from './gamePhysics.js';

const renderer = new THREE.WebGLRenderer(),
    scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera( 45, 1, 1, 10000 ),
    mainLight = new THREE.PointLight( 0xffffff, 1.0, 500, 2 ),
    ambientLight = new THREE.AmbientLight( 0xF0F0F0 ),
    geometry = new THREE.OctahedronGeometry(1, 1),
    texture = new THREE.TextureLoader().load('textures/checker/redwhite.jpg'),
    material = new THREE.MeshStandardMaterial({
        'map':       texture,
        'roughness': 0.8
    }),
    gball = new THREE.Mesh(geometry, material),
    container = document.body.querySelector('#main-container'),

    cubeGeometry = new THREE.BoxGeometry(10, 1, 1),
    cubeMaterial = new THREE.MeshBasicMaterial({color: 0x00FFFF}),
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

cube.position.y = 0 - floorbody.GetPosition().y;
scene.add(cube);

let translate = {x: 0, y: 0},
    scale = 25,
    cameraMaximumDimension = 1;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 512;
mainLight.shadow.mapSize.height = 512;
scene.add(mainLight);

scene.add(ambientLight);

texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 1);
gball.castShadow = true;
gball.receiveShadow = true;
scene.add(gball);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let timeStep = 1.0/60,
    velocityIterations = 6,
    positionIterations = 2;

(function animate() {
    world.Step(timeStep, velocityIterations, positionIterations);

    let pos = ballbody.GetPosition(),
        angle = ballbody.GetAngle();

    gball.rotation.x = angle;
    gball.rotation.y = angle;
    // gball.rotation.z = 0;
    gball.position.x = pos.x;
    gball.position.y = 0-pos.y;
    //gball.position.z = 0;
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
