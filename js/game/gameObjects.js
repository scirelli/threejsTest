import * as THREE from '/node_modules/three/build/three.module.js';
//import {OBJLoader} from '/node_modules/three/examples/jsm/loaders/OBJLoader.js';
import {
    Box2D
    // , b2Vec2
    // , b2CircleShape
    // , b2Body
    , b2FixtureDef
    , b2BodyDef
    , b2PolygonShape
    //,MulFV
    //,Dot,
    //,CrossVV
} from './box2d/Box2D.js';

function createGameObject(options) {
    return {
        physicsBody: createBoxPhysics(options.world, options.physics),
        mesh:        createBoxMesh( options.scene, options.mesh)
    };
}

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
function createBoxMesh(scene, options) {
    let material = new THREE[options.materialType]({
            'map':       new THREE[options.loaderType]().load(options.material.texturePath),
            'roughness': options.material.roughness
        }),
        box  = new THREE.Mesh(new THREE.BoxGeometry(options.mesh.width*2, options.mesh.height*2, options.mesh.depth || 1), material);

    box.position.x = options.mesh.position.x;
    box.position.y = -options.mesh.position.y;
    box.castShadow = options.mesh.castShadow || true;
    box.receiveShadow = options.mesh.receiveShadow || true;

    return box;
}

export {createBoxPhysics, createBoxMesh, createGameObject};
