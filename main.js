/*global THREE*/
//import {world, body} from './gamePhysics.js';

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
    ball = new THREE.Mesh( geometry, material ),
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
ball.castShadow = true;
ball.receiveShadow = true;
scene.add(ball);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();


var world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);

// make a circle
var shape = new Box2D.Collision.Shapes.b2CircleShape(3);
var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
fixtureDef.shape = shape;
fixtureDef.density = 1;
fixtureDef.friction = 0.5;
fixtureDef.restitution = 0.5;
var bodyDef = new Box2D.Dynamics.b2BodyDef();
bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
var body = world.CreateBody(bodyDef);
body.CreateFixture(fixtureDef);

// make a floor, slightly lopsided so stuff slides off
var floorshape = new Box2D.Collision.Shapes.b2PolygonShape();
floorshape.SetAsOrientedBox(
  100,
  1,
  {x:0,y:0},
  0
);
var floorfixtureDef = new Box2D.Dynamics.b2FixtureDef();
floorfixtureDef.shape = floorshape;
floorfixtureDef.density = 1;
floorfixtureDef.friction = 0.5;
floorfixtureDef.restitution = 0.5;
var floorbodyDef = new Box2D.Dynamics.b2BodyDef();
floorbodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
floorbodyDef.position = {x:0,y:10};
floorbodyDef.angle = 0.1;
var floorbody = world.CreateBody(floorbodyDef);
floorbody.CreateFixture(floorfixtureDef);

var timeStep = 1.0/60;
var iteration = 1;

function update() {
  world.Step(timeStep, iteration);
  var pb = body.GetPosition();
  var pf = floorbody.GetPosition()
  console.log(pb.x,pb.y,pf.x,pf.y);
  requestAnimationFrame(update);
}
update();


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
