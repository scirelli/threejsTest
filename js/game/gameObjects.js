import * as THREE from '/node_modules/three/build/three.module.js';
import {
    Box2D
    , b2FixtureDef
    , b2BodyDef
    , b2PolygonShape
    , b2CircleShape
} from '../box2d/Box2D.js';

//#################### Box ##############################################
/*
    options = {
       shape: {
            width,
            height,
            position: {},
            angle:
        },
        fixture: {
            density,
            friction,
            restitution,
        },
        body:{
            isDynamic,
            position {x:, y:},
            angle,
            linearDamping,
            angularDamping,
            fixedRotation
        }
    }
 */
function createBoxPhysics(world, options) {
    let shape = new b2PolygonShape(),
        fixtureDef = new b2FixtureDef(),
        bodyDef = new b2BodyDef(),
        body;

    shape.SetAsOrientedBox(options.shape.width, options.shape.height, {x: options.shape.x || 0, y: options.shape.y || 0}, options.shape.angle || 0);

    fixtureDef.shape = shape;
    fixtureDef.density = options.fixture.density || 1;
    fixtureDef.friction = options.fixture.friction || 0;
    fixtureDef.restitution = options.fixture.restitution || 1;

    bodyDef.type = options.body.isDynamic ? Box2D.Dynamics.b2Body.b2_dynamicBody : Box2D.Dynamics.b2Body.b2_staticBody;
    bodyDef.position = options.body.position || {x: 0, y: 0};
    bodyDef.angle = options.body.angle || 0.0;
    bodyDef.linearDamping = options.body.linearDamping || 0;
    bodyDef.angularDamping = options.body.angularDamping || 0;

    body = world.CreateBody(bodyDef);
    body.CreateFixture(fixtureDef);
    body.SetFixedRotation(options.body.fixedRotation || false);

    return body;
}

/*
options = {
    mesh: {
        position: {x:, y:},
        width,
        height,
        depth,
        castShadow,
        receiveShadow,
    },
    material: {
        materialType:
        loaderType:,
        texturePath:,
        roughness
    }
}
 */
function createBoxMesh(options) {
    let material = new THREE[options.material.materialType]({
            'map':       new THREE[options.material.loaderType]().load(options.material.texturePath),
            'roughness': options.material.roughness
        }),
        box  = new THREE.Mesh(new THREE.BoxGeometry(options.width*2, options.height*2, options.depth || 1), material);

    box.position.x = options.position.x;
    box.position.y = -options.position.y;
    box.castShadow = options.castShadow || true;
    box.receiveShadow = options.receiveShadow || true;

    return box;
}

//#################### Circle ###########################################

function createCirclePhysics(world, options) {
    let shape = new b2CircleShape(options.shape.radius),
        fixtureDef = new b2FixtureDef(),
        bodyDef = new b2BodyDef(),
        body;

    fixtureDef.shape = shape;
    fixtureDef.density = options.fixture.density || 0.0;
    fixtureDef.friction = options.fixture.friction || 0;
    fixtureDef.restitution = options.fixture.restitution || 1;

    bodyDef.type = options.body.isDynamic ? Box2D.Dynamics.b2Body.b2_dynamicBody : Box2D.Dynamics.b2Body.b2_staticBody;
    bodyDef.position = options.body.position || {x: 0, y: 0};
    bodyDef.angle = options.body.angle || 0.0;
    bodyDef.linearDamping = options.body.linearDamping || 0;
    bodyDef.angularDamping = options.body.angularDamping || 0;

    body = world.CreateBody(bodyDef);
    body.CreateFixture(fixtureDef);
    body.SetFixedRotation(options.body.fixedRotation || false);

    return body;
}

function createCircleMesh(options) {
    let texture = new THREE[options.material.loaderType]().load(options.material.texturePath, function(texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.offset.set(0, 0);
            texture.repeat.set(4, 4);
        }),
        material = new THREE[options.material.materialType]({
            'map':       texture,
            'roughness': options.material.roughness
        }),
        ball = new THREE.Mesh(new THREE.OctahedronGeometry(options.radius, options.detail), material);

    ball.position.x = options.position.x;
    ball.position.y = -options.position.y;
    ball.castShadow = options.castShadow || true;
    ball.receiveShadow = options.receiveShadow || true;

    return ball;
}


export {createBoxPhysics, createBoxMesh, createCirclePhysics, createCircleMesh};
