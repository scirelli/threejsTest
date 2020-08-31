/*global THREE*/
import {world, ballbody, floorbody, ball2body} from './gamePhysics.js';

const renderer = new THREE.WebGLRenderer(),
    scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera( 45, 1, 1, 10000 ),
    mainLight = new THREE.PointLight( 0xffffff, 1.0, 500, 2 ),
    ambientLight = new THREE.AmbientLight( 0xF0F0F0 ),
    geometry = new THREE.OctahedronGeometry(1, 2),
    texture = new THREE.TextureLoader().load('textures/checker/redwhite.jpg'),
    material = new THREE.MeshStandardMaterial({
        'map':       texture,
        'roughness': 0.8
    }),
    gball = new THREE.Mesh(geometry, material),
    gball2 = new THREE.Mesh(geometry, material),
    container = document.body.querySelector('#main-container'),

    cubeGeometry = new THREE.BoxGeometry(10, 1, 1),
    cubeMaterial = new THREE.MeshBasicMaterial({color: 0x00FFFF}),
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

cube.position.y = -floorbody.GetPosition().y + 0.5;
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

gball2.castShadow = true;
gball2.receiveShadow = true;
scene.add(gball2);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let timeStep = 1.0/60,
    iteration = 1;

(function animate() {
    world.Step(timeStep, iteration);

    let pos = ballbody.GetPosition(),
        angle = ballbody.GetAngle(),
        pf = floorbody.GetPosition();

    gball.rotation.x = angle;
    gball.rotation.y = angle;
    gball.position.x = pos.x;
    gball.position.y = 0-pos.y;

    pos = ball2body.GetPosition(),
    angle = ball2body.GetAngle();

    gball2.rotation.x = angle;
    gball2.rotation.y = angle;
    gball2.position.x = pos.x;
    gball2.position.y = 0-pos.y;

    console.log(pos.x, pos.y, pf.x, pf.y);

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
