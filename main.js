/*global THREE*/
const renderer = new THREE.WebGLRenderer(),
    scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera( 45, 1, 1, 10000 ),
    mainLight = new THREE.PointLight( 0xffffff, 1.0, 500, 2 ),
    ambientLight = new THREE.AmbientLight( 0xF0F0F0 ),
    geometry = new THREE.OctahedronGeometry(1, 0),
    texture = new THREE.TextureLoader().load('textures/checker/redwhite.jpg'),
    material = new THREE.MeshStandardMaterial({
        'map':       texture,
        'roughness': 0.8
    }),
    body = new THREE.Mesh( geometry, material ),
    container = document.body.querySelector('#main-container');

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
texture.repeat.set( 1, 1 );
body.castShadow = true;
body.receiveShadow = true;
scene.add(body);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let frameTime = 1,
    frameEndTime = performance.now();
(function animate() {
    body.rotation.z += 10*((frameEndTime-frameTime)/1000);
    frameTime = performance.now();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    frameEndTime = performance.now();
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
